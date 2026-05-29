const { order } = require("../db/models");

const findAll = async (
  query,
  page,
  limit,
  attributes = {},
  include = [],
  transaction = null,
) => {
  const offset = (page - 1) * limit;
  try {
    const result = await order.findAll({
      where: query,
      offset,
      limit,
      subQuery: false,
      attributes,
      ...(include.length > 0 && { include }),
      transaction,
    });
    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const findOne = async (
  query,
  attributes = {},
  include = [],
  transaction = null,
) => {
  try {
    const result = await order.findOne({
      where: query,
      attributes,
      ...(include.length > 0 && { include }),
      transaction,
    });
    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const create = async (data, transaction = null) => {
  try {
    const result = await order.create(data, { transaction });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const update = async (data, query = {}, transaction = null) => {
  try {
    const result = await order.update(data, {
      where: query,
      transaction,
    });
    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const remove = async (query = {}, transaction = null) => {
  try {
    const result = await order.destroy({
      where: query,
      transaction,
    });
    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  remove,
};
