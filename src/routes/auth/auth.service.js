const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const authDb = require("../../dbUtils/authDb");
const { hashPassword } = require("../../helper/bcrypt");
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

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    result.toJSON(),
  );

  const data = {
    fullname: result.fullname,
    email: result.email,
    phoneNumber: result.phoneNumber,
    role: result.role,
    isActive: result.isActive,
  };

  return { data, accessToken, refreshToken };
};

module.exports = { register };
