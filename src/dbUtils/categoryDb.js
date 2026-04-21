const { category } = require("../db/models");

// findAll
const findAll = async (query = {}) => {
  try {
    const result = await category.findAll({
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// findOne
const findOne = async (query = {}, attributes = {}) => {
  try {
    const result = await category.findOne({
      where: query,
      attributes,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// create
const create = async (data) => {
  try {
    const result = await category.create(data);

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// update
const update = async (data, query) => {
  try {
    const result = await category.update(data, {
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// remove
const remove = async (query) => {
  try {
    const result = await category.destroy({
      where: query,
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
