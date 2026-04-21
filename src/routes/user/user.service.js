const { Op } = require("sequelize");
const userDb = require("../../dbUtils/userDb");
const { hashPassword } = require("../../helper/bcrypt");

// getUsers
const getUsers = async (search, page, limit) => {
  let query;
  if (search) {
    query = {
      [Op.or]: [{ role: { [Op.like]: `%${search}%` } }],
    };
  }

  const result = await userDb.findAll(query, page, limit);

  if (!result) {
    throw new Error("USER_NOT_FOUND");
  }

  return result;
};

// createUser
const createUser = async (body) => {
  const { email, password } = body;

  const query = {
    email: {
      [Op.eq]: `${email}`,
    },
  };
  const isExists = await userDb.findOne(query);

  if (isExists) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const newBody = {
    hash_password: hashedPassword,
    ...body,
  };

  const result = await userDb.create(newBody);

  if (!result) {
    throw new Error("USER_NOT_FOUND");
  }

  delete result.created_at;
  delete result.updated_at;
  delete result.hash_password;

  return result;
};

module.exports = {
  getUsers,
  createUser,
};
