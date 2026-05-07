const { user } = require("../db/models");

// findOne
const findOne = async (query = {}, attributes = {}, transaction) => {
  try {
    const result = await user.findOne({
      where: query,
      attributes,
      transaction,
    });
    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

// create
const create = async (data, transaction) => {
  try {
    const result = await user.create(data, { transaction });
    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

// update
const update = async (data, query, transaction) => {
  try {
    const result = await user.update(data, {
      where: query,
      transaction,
    });
    return result;
  } catch (error) {
    console.log(error.message || error);
  }
};

module.exports = { findOne, create, update };
