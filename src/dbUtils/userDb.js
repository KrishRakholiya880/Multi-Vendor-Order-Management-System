const { user } = require("../db/models");

// findOne
const findOne = async (
  query = {},
  attributes = {},
  include = [],
  transaction,
) => {
  try {
    const result = await user.findOne({
      where: query,
      attributes,
      ...(include.length > 0 && { include }),
      transaction,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// findAll
const findAll = async (query = {}, sortBy, page, limit, transaction) => {
  const offset = (page - 1) * limit;
  const order = sortBy === "asc" ? "ASC" : "DESC";
  try {
    const result = await user.findAll({
      where: query,
      limit,
      offset,
      order: [["created_at", order]],
      transaction,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// create
const create = async (data, transaction) => {
  try {
    const result = await user.create(data, { transaction });

    return result.toJSON();
  } catch (error) {
    console.log(error?.message || error);
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
    console.log(error?.message || error);
  }
};

// remove
const remove = async (query, transaction) => {
  try {
    const result = await user.destroy({
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = {
  findOne,
  findAll,
  create,
  update,
  remove,
};
