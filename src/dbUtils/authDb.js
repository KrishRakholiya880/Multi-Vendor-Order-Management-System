const { user } = require("../db/models");

// findOne
const findOne = async (query) => {
  const result = await user.findOne({
    where: query,
  });
  return result;
};

// create
const create = async (body) => {
  const result = await user.create(body);
  return result;
};

module.exports = { findOne, create };
