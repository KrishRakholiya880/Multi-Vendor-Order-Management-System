const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
// dbUtils
const authDb = require("../../dbUtils/authDb");
const refreshTokenDb = require("../../dbUtils/refreshTokenDb");
// helper
const { hashPassword, comparePassword } = require("../../helper/bcrypt");
const {
  generateAccessAndRefreshTokens,
  decodeToken,
} = require("../../helper/authHelper");
// config
const { tokenKeys } = require("../../config/index");

const expiryDate = () => {
  const currentDate = new Date();
  currentDate.setDate(
    currentDate.getDate() + Number(tokenKeys.REFRESH_TOKEN_EXPIRY),
  );

  const newDate = currentDate.toISOString();
  return newDate;
};

// register
const register = async (body) => {
  // const t = sequelize.transaction();
  const { email, password } = body;

  const query = {
    email: { [Op.eq]: `${email}` },
  };

  const isExists = await authDb.findOne(query);

  if (isExists) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const newBody = {
    hash_password: hashedPassword,
    ...body,
  };

  const data = await authDb.create(newBody);

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
    id: data.id,
  });

  const refreshTokenData = {
    user_id: data?.id,
    token: refreshToken,
    expires_at: expiryDate(),
  };

  await refreshTokenDb.create(refreshTokenData);

  delete data.created_at;
  delete data.updated_at;
  delete data.hash_password;

  return { data, accessToken, refreshToken };
};

// login
const login = async (body) => {
  // const t = sequelize.transaction();
  const { email, password } = body;

  const query = {
    email: {
      [Op.eq]: `${email}`,
    },
  };

  const existingUser = await authDb.findOne(query, [
    "id",
    "full_name",
    "email",
    "phone_number",
    "is_active",
    "role",
    "hash_password",
  ]);

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const isSamePassword = await comparePassword(
    password,
    existingUser?.hash_password,
  );

  if (!isSamePassword) {
    throw new Error("WRONG_PASSWORD");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
    id: existingUser.id,
  });

  const existingToken = await refreshTokenDb.findOne({
    user_id: existingUser?.id,
  });

  const refreshTokenData = {
    user_id: existingUser?.id,
    token: refreshToken,
    expires_at: expiryDate(),
  };

  if (!existingToken) {
    await refreshTokenDb.create(refreshTokenData);
  } else {
    await refreshTokenDb.update(
      { token: refreshToken },
      { user_id: existingUser?.id },
    );
  }

  // removes hash_pasword from response
  delete existingUser?.hash_password;

  return { data: existingUser, accessToken, refreshToken };
};

// logout
const logout = async (refreshToken) => {
  // const t = sequelize.transaction();
  if (!refreshToken) {
    throw new Error("REFRESH_TOKEN_REQUIRED");
  }

  const query = {
    token: refreshToken,
  };

  const result = await refreshTokenDb.remove(query);
  return result;
};

// refreshToken
const refreshToken = async (oldRefreshToken) => {
  // const t = sequelize.transaction();
  if (!oldRefreshToken) {
    throw new Error("REFRESH_TOKEN_REQUIRED");
  }

  const query = {
    token: oldRefreshToken,
  };

  const result = await refreshTokenDb.findOne(query);

  const currentDate = new Date();
  const expiryDate = new Date(result?.expires_at);

  if (currentDate > expiryDate) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
    id: result?.user_id,
  });

  console.log(result);

  await refreshTokenDb.update(
    { token: refreshToken },
    { user_id: result?.user_id },
  );

  return { accessToken, refreshToken };
};

// profile
const profile = async (accessToken) => {
  // const t = sequelize.transaction();
  const decodedData = decodeToken(accessToken);
  const query = {
    id: decodedData?.id,
  };

  const result = await authDb.findOne(query, [
    "id",
    "full_name",
    "email",
    "phone_number",
    "is_active",
    "role",
  ]);
  return result;
};

module.exports = { register, login, logout, refreshToken, profile };
