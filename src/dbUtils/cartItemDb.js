const { cart_item } = require("../db/models");

const findAll = async (query, include = [], transaction) => {
  try {
    const result = await cart_item.findAll({
      where: query,
      include,
      transaction,
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const findOne = async (query, include = [], transaction) => {
  try {
    const result = await cart_item.findOne({
      where: query,
      include,
      transaction,
    });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (body, transaction) => {
  try {
    const result = await cart_item.create(body, { transaction });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (body, query, transaction) => {
  try {
    const result = await cart_item.update(body, {
      where: query,
      transaction,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const remove = async (query, transaction) => {
  try {
    const result = await cart_item.destroy({
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
