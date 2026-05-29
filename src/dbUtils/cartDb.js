const { cart, cart_item } = require("../db/models");

const findAll = async (
  query = {},
  attributes = [],
  include = [],
  page,
  limit,
  transaction = null,
) => {
  try {
    const offset = (page - 1) * limit;
    const result = await cart.findAll({
      where: query,
      limit,
      offset,
      ...(attributes.length > 0 && { attributes }),
      ...(include.length > 0 && { include }),
      transaction,
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const findOne = async (
  query = {},
  attributes = [],
  include = [],
  transaction = null,
) => {
  try {
    const result = await cart.findOne({
      where: query,
      attributes,
      ...(include.length > 0 && { include }),
      transaction,
    });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (data, transaction = null) => {
  try {
    const cartResult = await cart.create(data, { transaction });
    return cartResult;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (data, query, transaction = null) => {
  try {
    const result = await cart.update(data, {
      where: query,
      transaction,
    });
    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const remove = async (query, transaction = null) => {
  try {
    const result = await cart.destroy({
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
