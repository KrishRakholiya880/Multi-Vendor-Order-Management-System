const { cart_item } = require("../db/models");

const findAll = async (
  query,
  attributes = {},
  include = [],
  transaction = null,
) => {
  try {
    const result = await cart_item.findAll({
      where: query,
      attributes,
      include,
      transaction,
    });

    return result ? result.map((item) => item.toJSON()) : null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const findOne = async (
  query,
  attributes = {},
  include = [],
  transaction = null,
) => {
  try {
    const result = await cart_item.findOne({
      where: query,
      attributes,
      include,
      transaction,
    });

    return result ? result.toJSON() : null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const create = async (body, transaction = null) => {
  try {
    const result = await cart_item.create(body, { transaction });

    return result ? result.toJSON() : null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const update = async (body, query, transaction = null) => {
  try {
    const result = await cart_item.update(body, {
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
    const result = await cart_item.destroy({
      where: query,
      transaction,
    });

    return result;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  remove,
};
