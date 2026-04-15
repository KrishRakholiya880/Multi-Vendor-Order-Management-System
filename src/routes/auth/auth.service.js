const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const authDb = require("../../dbUtils/authDb");
const { hashPassword, comparePassword } = require("../../helper/bcrypt");
const { generateAccessAndRefreshTokens } = require("../../helper/authHelper");

// register
const register = async (body) => {
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
    ...body,
    password: hashedPassword,
  };

  const result = await authDb.create(newBody);

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
    id: result.id,
  });

  await authDb.update({ refreshToken: refreshToken }, { id: result.id });

  const data = {
    fullname: result.fullname,
    email: result.email,
    phoneNumber: result.phoneNumber,
    role: result.role,
    isActive: result.isActive,
  };

  return { data, accessToken, refreshToken };
};

const login = async (body) => {
  const { email, password } = body;

  const query = {
    email: {
      [Op.eq]: `${email}`,
    },
  };

  const existingUser = await authDb.findOne(query);

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const isSamePassword = await comparePassword(
    password,
    existingUser?.password,
  );

  if (!isSamePassword) {
    throw new Error("WRONG_PASSWORD");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    existingUser.toJSON(),
  );

  const data = {
    fullname: existingUser.fullname,
    email: existingUser.email,
    phoneNumber: existingUser.phoneNumber,
    role: existingUser.role,
    isActive: existingUser.isActive,
  };

  return { data, accessToken, refreshToken };
};

module.exports = { register, login };
