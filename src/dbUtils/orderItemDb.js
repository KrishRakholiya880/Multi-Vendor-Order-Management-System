const { order_item } = require("../db/models");

const findOne = async (query, attributes = {}, transaction = null) => {
  try {
    const result = await order_item.findOne({
      where: query,
      attributes,
      transaction,
    });

    return result.toJSON() || null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const findAll = async (
  query,
  attributes = [],
  include = [],
  transaction = null,
) => {
  try {
    const result = await order_item.findAll({
      where: query,
      ...(attributes.length > 0 && { attributes }),
      ...(include.length > 0 && { include }),
      transaction,
    });
    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const create = async (data, transaction = null) => {
  try {
    const result = await order_item.create(data, { transaction });

    return result.map((item) => item.toJSON()) || result.toJSON();
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const bulkCreate = async (data, transaction = null) => {
  try {
    const result = await order_item.bulkCreate(data, { transaction });

    return result
      ? result.map((item) => item.toJSON())
      : result.toJSON() || null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const update = async (data, query, transaction = null) => {
  try {
    const result = await order_item.update(data, {
      where: query,
      transaction,
    });

    return result;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const remove = async (query, transaction = null) => {
  try {
    const result = await order_item.destroy({
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
  bulkCreate,
  update,
  remove,
};
