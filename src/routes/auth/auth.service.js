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

const getExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Number(tokenKeys.REFRESH_TOKEN_EXPIRY));
  return date.toISOString();
};

// register
const register = async (body) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = body;

    const isExists = await authDb.findOne(
      { email: { [Op.eq]: `${email}` } },
      {},
      t,
    );
    if (isExists) throw new Error("USER_EXISTS");

    const hashedPassword = await hashPassword(password);
    const data = await authDb.create(
      {
        ...body,
        hash_password: hashedPassword,
      },
      t,
    );

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
    throw error;
  }
};

// login
const login = async (body) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = body;

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

    if (!existingUser) throw new Error("USER_NOT_FOUND");

    if (existingUser?.status === "inactive")
      throw new Error("ACCOUNT_DEACTIVATED");

    const isSamePassword = await comparePassword(
      password,
      existingUser?.hash_password,
    );
    if (!isSamePassword) throw new Error("INVALID_PASSWORD");

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
      id: existingUser.id,
    });

    const existingToken = await refreshTokenDb.findOne(
      {
        user_id: existingUser?.id,
      },
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
        { token: refreshToken },
        { user_id: existingUser?.id },
        t,
      );
    }

    delete existingUser?.hash_password;

    await t.commit();
    return { data: existingUser, accessToken, refreshToken };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// logout
const logout = async (refreshToken) => {
  const t = await sequelize.transaction();
  try {
    if (!refreshToken) throw new Error("REFRESH_TOKEN_REQUIRED");

    const result = await refreshTokenDb.remove(
      {
        token: { [Op.eq]: `${refreshToken}` },
      },
      t,
    );

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// refreshToken
const refreshToken = async (oldRefreshToken) => {
  const t = await sequelize.transaction();
  try {
    if (!oldRefreshToken) throw new Error("REFRESH_TOKEN_REQUIRED");

    const result = await refreshTokenDb.findOne(
      {
        token: { [Op.eq]: `${oldRefreshToken}` },
      },
      t,
    );

    if (new Date() > new Date(result?.expires_at)) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
      id: result?.user_id,
    });

    await refreshTokenDb.update(
      { token: refreshToken },
      { user_id: result?.user_id },
      t,
    );

    await t.commit();
    return { accessToken, refreshToken };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// profile
const profile = async (userData) => {
  const t = await sequelize.transaction();

  try {
    if (userData?.role !== "vendor") {
      if (!userData) throw new Error("USER_DATA_NOT_FOUND");
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
    );

    if (!result) throw new Error("USER_DATA_NOT_FOUND");

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// changePassword
const changePassword = async (user_id, data) => {
  const t = await sequelize.transaction();

  try {
    const existingUser = await authDb.findOne(
      { id: { [Op.eq]: `${user_id}` } },
      ["hash_password"],
    );

    if (!existingUser) throw new Error("USER_NOT_FOUND");

    const isSamePassword = await comparePassword(
      data.old_password,
      existingUser?.hash_password,
    );
    if (!isSamePassword) throw new Error("INVALID_PASSWORD");

    const newHashedPassword = await hashPassword(data.new_password);

    return await authDb.update(
      { hash_password: newHashedPassword },
      { id: { [Op.eq]: `${user_id}` } },
    );
    await t.commit();
  } catch (error) {
    await t.rollback();
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
