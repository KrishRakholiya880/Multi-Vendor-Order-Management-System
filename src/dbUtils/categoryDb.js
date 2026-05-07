const { category } = require("../db/models");

// findAll
const findAll = async (query = {}, transaction) => {
  try {
    const result = await category.findAll({
      where: query,
      transaction,
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// findOne
const findOne = async (query = {}, attributes = {}, transaction) => {
  try {
    const result = await category.findOne({
      where: query,
      attributes,
      transaction,
    });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// create
const create = async (data, transaction) => {
  try {
    const result = await category.create(data, { transaction });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// update
const update = async (data, query, transaction) => {
  try {
    const result = await category.update(data, {
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
    const result = await category.destroy({
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
