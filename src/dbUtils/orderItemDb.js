const { order_item } = require("../db/models");

const findOne = async (query, attributes = {}, transaction) => {
  try {
    const result = await order_item.findOne({
      where: query,
      attributes,
      transaction,
    });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const findAll = async (query, attributes = [], include = [], transaction) => {
  try {
    const result = await order_item.findAll({
      where: query,
      ...(attributes.length > 0 && { attributes }),
      ...(include.length > 0 && { include }),
      transaction,
    });
    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const create = async (data, transaction) => {
  try {
    const result = await order_item.create(data, { transaction });

    return result.map((item) => item.toJSON()) || result.toJSON();
  } catch (error) {
    console.log(error.message || error);
  }
};

const update = async (data, query, transaction) => {
  try {
    const result = await order_item.update(data, {
      where: query,
      transaction,
    });

    return result;
  } catch (error) {
    console.log(error.message || error);
  }
};

const remove = async (query, transaction) => {
  try {
    const result = await order_item.destroy({
      where: query,
      transaction,
    });

    return result;
  } catch (error) {
    console.log(error.message || error);
  }
};

module.exports = {
  findOne,
  findAll,
  create,
  update,
  remove,
};
