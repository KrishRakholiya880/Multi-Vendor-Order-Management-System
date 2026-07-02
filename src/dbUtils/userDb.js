const { user } = require("../db/models");

// findOne
const findOne = async (
  query = {},
  attributes = {},
  include = [],
  transaction = null,
) => {
  try {
    const result = await user.findOne({
      where: query,
      attributes,
      ...(include.length > 0 && { include }),
      transaction,
    });

    return result ? result.toJSON() : null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

// findAll
const findAll = async (
  query = {},
  attributes = {},
  sortBy,
  page,
  limit,
  transaction = null,
) => {
  const offset = (page - 1) * limit;
  const order = sortBy === "asc" ? "ASC" : "DESC";
  try {
    const result = await user.findAll({
      where: query,
      attributes,
      limit,
      offset,
      order: [["created_at", order]],
      transaction,
    });

    return result ? result.map((u) => u.toJSON()) : null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

// create
const create = async (data, transaction = null) => {
  try {
    const result = await user.create(data, { transaction });

    return result ? result.toJSON() : null;
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

// remove
const remove = async (query, transaction = null) => {
  try {
    const result = await user.destroy({
      where: query,
      transaction,
    });

    return result;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

module.exports = {
  findOne,
  findAll,
  create,
  update,
  remove,
};
