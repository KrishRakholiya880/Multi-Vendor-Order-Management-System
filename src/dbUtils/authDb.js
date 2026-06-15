const { user } = require("../db/models");

// findOne
const findOne = async (query = {}, attributes = {}, transaction = null) => {
  try {
    const result = await user.findOne({
      where: query,
      attributes,
      transaction,
    });
    return result.toJSON() || null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

// create
const create = async (data, transaction = null) => {
  try {
    const result = await user.create(data, { transaction });
    return result.toJSON() || null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

// update
const update = async (data, query, transaction = null) => {
  try {
    const result = await user.update(data, {
      where: query,
      transaction,
    });
    return result;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

module.exports = { findOne, create, update };
