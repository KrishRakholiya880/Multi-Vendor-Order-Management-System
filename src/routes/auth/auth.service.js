const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const { vendor_detail } = require("../../db/models");
// dbUtils
const authDb = require("../../dbUtils/authDb");
const refreshTokenDb = require("../../dbUtils/refreshTokenDb");
const userDb = require("../../dbUtils/userDb");
const { hashPassword, comparePassword } = require("../../helper/bcrypt");
const { generateAccessAndRefreshTokens } = require("../../helper/authHelper");
const { tokenKeys } = require("../../config/index");
const { logger } = require("../../helper/logger");
const redisClient = require("../../helper/redis");

const getExpiryDate = () => {
  const date = new Date();
  const expiry = tokenKeys.REFRESH_TOKEN_EXPIRY;
  const days = parseInt(expiry);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// register
const register = async (body, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = body;
    const attemptKey = `register-attempts:${email}`;

    logger.info("Registration attempt", {
      email,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    const isExists = await authDb.findOne(
      {
        [Op.or]: [
          { email: { [Op.eq]: `${email}` } },
          { phone_number: { [Op.eq]: `${body?.phone_number}` } },
        ],
      },
      ["id", "full_name", "email"],
      t,
    );

    if (isExists) {
      await redisClient.INCR_WITH_EXPIRY(attemptKey, 15 * 60);
      throw new Error("USER_EXISTS");
    }

    const hashedPassword = await hashPassword(password);
    const data = await authDb.create(
      {
        ...body,
        hash_password: hashedPassword,
      },
      t,
    );

    logger.info("Registration successful", {
      user_id: data?.id,
      username: data?.full_name,
      email: data?.email,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await redisClient.DELETE(attemptKey);

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
      id: data.id,
    });

    await refreshTokenDb.create(
      {
        user_id: data?.id,
        token: refreshToken,
        expires_at: getExpiryDate(),
      },
      t,
    );

    delete data.created_at;
    delete data.updated_at;
    delete data.hash_password;

    await t.commit();
    return { data, accessToken, refreshToken };
  } catch (error) {
    await t.rollback();
    logger.error("Registration error:", {
      email: body?.email,
      error: error.message,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });
    throw error;
  }
};

// login
const login = async (body, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = body;
    const attemptKey = `login-attempts:${email}`;

    const existingUser = await authDb.findOne(
      { email: { [Op.eq]: `${email}` } },
      [
        "id",
        "full_name",
        "email",
        "phone_number",
        "status",
        "role",
        "hash_password",
      ],
      t,
    );

    logger.info("Login attempt", {
      ...(existingUser?.id && { user_id: existingUser?.id }),
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    if (!existingUser) throw new Error("USER_NOT_FOUND");

    if (existingUser?.status === "inactive")
      throw new Error("ACCOUNT_DEACTIVATED");

    const isSamePassword = await comparePassword(
      password,
      existingUser?.hash_password,
    );

    if (!isSamePassword) {
      const attempts = await redisClient.INCR_WITH_EXPIRY(attemptKey, 15 * 60);
      throw new Error("INVALID_PASSWORD");
    }

    logger.info("Login successful", {
      user_id: existingUser?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await redisClient.DELETE(attemptKey);

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
      id: existingUser.id,
    });

    const existingToken = await refreshTokenDb.findOne(
      { user_id: existingUser?.id },
      t,
    );

    const refreshTokenData = {
      user_id: existingUser?.id,
      token: refreshToken,
      expires_at: getExpiryDate(),
    };

    if (!existingToken) {
      await refreshTokenDb.create(refreshTokenData, t);
    } else {
      await refreshTokenDb.update(
        { token: refreshToken, expires_at: refreshTokenData.expires_at },
        { user_id: existingUser?.id },
        t,
      );
    }

    delete existingUser?.hash_password;

    await t.commit();
    return { data: existingUser, accessToken, refreshToken };
  } catch (error) {
    await t.rollback();
    const attemptKey = `login-attempts:${body?.email}`;
    const attempts = await redisClient.GET(attemptKey);
    logger.error("Login error:", {
      error: error?.message,
      attempts: attempts ? Number(attempts) : undefined,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });
    throw error;
  }
};

// logout
const logout = async (refreshToken, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    if (!refreshToken) throw new Error("REFRESH_TOKEN_REQUIRED");

    const result = await refreshTokenDb.remove(
      { token: { [Op.eq]: `${refreshToken}` } },
      t,
    );

    logger.info("Logout successful", {
      user_id: userData?.id,
      url: reqUrlMet?.url,
      method: reqUrlMet?.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Logout error:", {
      user_id: userData?.id,
      error: error.message,
      url: reqUrlMet?.url,
      method: reqUrlMet?.method,
      requestId: reqUrlMet.requestId,
    });
    throw error;
  }
};

// renewAccessToken
const renewAccessToken = async (oldRefreshToken, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    if (!oldRefreshToken) throw new Error("REFRESH_TOKEN_REQUIRED");
    const attemptKey = `refresh-attempts:${userData?.id}`;

    const result = await refreshTokenDb.findOne(
      { token: { [Op.eq]: `${oldRefreshToken}` }, user_id: `${userData?.id}` },
      t,
    );

    if (!result) {
      await redisClient.INCR_WITH_EXPIRY(attemptKey, 15 * 60);
      throw new Error("TOKEN_NOT_FOUND");
    }

    if (new Date() > new Date(result?.expires_at)) {
      await refreshTokenDb.remove({ user_id: result.user_id });
      return { removeAccessAndData: true };
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
      id: result?.user_id,
    });

    await refreshTokenDb.update(
      { token: refreshToken, expires_at: getExpiryDate() },
      { token: `${oldRefreshToken}` },
      t,
    );

    logger.info("Token refreshed successfully", {
      user_id: result?.user_id,
      url: reqUrlMet?.url,
      method: reqUrlMet?.method,
      requestId: reqUrlMet.requestId,
    });

    await redisClient.DELETE(attemptKey);

    await t.commit();
    return { accessToken, refreshToken };
  } catch (error) {
    await t.rollback();
    logger.error("Refresh token error:", {
      user_id: userData?.id,
      error: error.message,
      url: reqUrlMet?.url,
      method: reqUrlMet?.method,
      requestId: reqUrlMet.requestId,
    });
    throw error;
  }
};

// profile
const profile = async (userData, reqUrlMet) => {
  const t = await sequelize.transaction();

  try {
    logger.info("Profile fetch attempt", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    if (!userData) throw new Error("USER_DATA_NOT_FOUND");

    if (userData?.role !== "vendor") {
      logger.info("Profile fetched successfully", {
        user_id: userData?.id,
        url: reqUrlMet.url,
        method: reqUrlMet.method,
        requestId: reqUrlMet.requestId,
      });
      await t.commit();
      return userData;
    }

    const result = await userDb.findOne(
      { id: { [Op.eq]: `${userData?.id}` } },
      ["id", "full_name", "email", "phone_number", "status", "role"],
      [
        {
          model: vendor_detail,
          as: "vendor_detail",
          attributes: [
            "id",
            "user_id",
            "company_name",
            "company_email",
            "company_phone_number",
            "company_address",
            "company_city",
          ],
        },
      ],
      t,
    );

    if (!result) throw new Error("USER_DATA_NOT_FOUND");

    logger.info("Profile fetched successfully", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Profile fetch error:", {
      user_id: userData?.id,
      error: error.message,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });
    throw error;
  }
};

// changePassword
const changePassword = async (userData, data, reqUrlMet) => {
  const t = await sequelize.transaction();

  try {
    logger.info("Change password attempt", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    const existingUser = await authDb.findOne(
      { id: { [Op.eq]: `${userData?.id}` } },
      ["hash_password"],
      t,
    );

    if (!existingUser) throw new Error("USER_NOT_FOUND");

    const isSamePassword = await comparePassword(
      data.old_password,
      existingUser?.hash_password,
    );

    if (!isSamePassword) throw new Error("INVALID_PASSWORD");

    const newHashedPassword = await hashPassword(data.new_password);

    const result = await authDb.update(
      { hash_password: newHashedPassword },
      { id: { [Op.eq]: `${userData?.id}` } },
      t,
    );

    logger.info("Password changed successfully", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Change password error:", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  register,
  login,
  logout,
  renewAccessToken,
  profile,
  changePassword,
};
