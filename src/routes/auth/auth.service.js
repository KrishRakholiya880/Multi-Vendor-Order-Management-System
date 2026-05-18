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
const { logger, attemptTracker } = require("../../helper/logger");

const getExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Number(tokenKeys.REFRESH_TOKEN_EXPIRY));
  return date.toISOString();
};

// register
const register = async (body, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = body;

    logger.info("Registration attempt", { email, url: reqUrlMet.url });

    const isExists = await authDb.findOne(
      { email: { [Op.eq]: `${email}` } },
      {},
      t,
    );

    if (isExists) {
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
    });

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

    await attemptTracker[email];
    await t.commit();
    return { data, accessToken, refreshToken };
  } catch (error) {
    await t.rollback();
    logger.error("Registration error", {
      email: body?.email,
      error: error.message,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });
    throw error;
  }
};

// login
const login = async (body, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = body;

    logger.info("Login attempt", { email, url: reqUrlMet.url });

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

    if (!existingUser) {
      throw new Error("USER_NOT_FOUND");
    }

    if (existingUser?.status === "inactive") {
      throw new Error("ACCOUNT_DEACTIVATED");
    }

    const isSamePassword = await comparePassword(
      password,
      existingUser?.hash_password,
    );

    if (!isSamePassword) {
      throw new Error("INVALID_PASSWORD");
    }

    logger.info("Login successful", {
      user_id: existingUser?.id,
      email,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });
    delete attemptTracker[email];

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
    logger.error("Login error", {
      email: body?.email,
      error: error.message,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });
    throw error;
  }
};

// logout
const logout = async (refreshToken, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    if (!refreshToken) {
      throw new Error("REFRESH_TOKEN_REQUIRED");
    }

    const result = await refreshTokenDb.remove(
      { token: { [Op.eq]: `${refreshToken}` } },
      t,
    );

    logger.info("Logout successful", {
      user_id: userData?.id,
      url: reqUrlMet?.url,
      method: reqUrlMet?.method,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Logout error", {
      user_id: userData?.id,
      error: error.message,
      url: reqUrlMet?.url,
      method: reqUrlMet?.method,
    });
    throw error;
  }
};

// refreshToken
const refreshToken = async (oldRefreshToken, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    if (!oldRefreshToken) {
      throw new Error("REFRESH_TOKEN_REQUIRED");
    }

    const result = await refreshTokenDb.findOne(
      { token: { [Op.eq]: `${oldRefreshToken}` } },
      t,
    );

    if (!result) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    if (new Date() > new Date(result?.expires_at)) {
      await refreshTokenDb.remove({ user_id: result?.user_id }, t);
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
      id: result?.user_id,
    });

    await refreshTokenDb.update(
      { token: refreshToken, expires_at: getExpiryDate() },
      { user_id: result?.user_id },
      t,
    );

    logger.info("Token refreshed successfully", {
      user_id: result?.user_id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });

    await t.commit();
    return { accessToken, refreshToken };
  } catch (error) {
    await t.rollback();
    logger.error("Refresh token error", {
      error: error.message,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
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
    });

    if (!userData) {
      throw new Error("USER_DATA_NOT_FOUND");
    }

    if (userData?.role !== "vendor") {
      logger.info("Profile fetched successfully", {
        user_id: userData?.id,
        url: reqUrlMet.url,
        method: reqUrlMet.method,
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

    if (!result) {
      throw new Error("USER_DATA_NOT_FOUND");
    }

    logger.info("Profile fetched successfully", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Profile fetch error", {
      user_id: userData?.id,
      error: error.message,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
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
    });

    const existingUser = await authDb.findOne(
      { id: { [Op.eq]: `${userData?.id}` } },
      ["hash_password"],
      t,
    );

    if (!existingUser) {
      throw new Error("USER_NOT_FOUND");
    }

    const isSamePassword = await comparePassword(
      data.old_password,
      existingUser?.hash_password,
    );

    if (!isSamePassword) {
      throw new Error("INVALID_PASSWORD");
    }

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
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Change password error", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  profile,
  changePassword,
};
