const { order } = require("../db/models");

const findAll = async (query, attributes = {}, include = [], transaction) => {
  try {
    const result = await order.findAll({
      where: query,
      attributes,
      ...(include.length > 0 && { include }),
      transaction,
    });
    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const findOne = async (query, attributes = {}, include = [], transaction) => {
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

const create = async (data, transaction) => {
  try {
    const result = await order.create(data, { transaction });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const update = async (data, query = {}, transaction) => {
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

const remove = async (query = {}, transaction) => {
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
