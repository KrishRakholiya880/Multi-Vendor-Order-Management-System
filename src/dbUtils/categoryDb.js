const { category } = require("../db/models");

// findAll
const findAll = async (query = {}, attributes = {}, transaction = null) => {
  try {
    const result = await category.findAll({
      where: query,
      attributes,
      transaction,
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

// findOne
const findOne = async (query = {}, attributes = {}, transaction = null) => {
  try {
    const result = await category.findOne({
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
    const result = await category.create(data, { transaction });

    return result.toJSON() || null;
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

// update
const update = async (data, query, transaction = null) => {
  try {
    const result = await category.update(data, {
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
    const result = await category.destroy({
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
