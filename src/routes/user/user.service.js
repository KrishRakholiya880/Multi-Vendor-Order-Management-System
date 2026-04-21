const { Op } = require("sequelize");
const userDb = require("../../dbUtils/userDb");

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

module.exports = {
  getUsers,
};
