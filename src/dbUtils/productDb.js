const { product } = require("../db/models");

// findOne
const findOne = async (query = {}, attributes = {}) => {
  try {
    const result = await product.findOne({
      where: query,
      attributes,
    });
    return result.toJSON();
  } catch (error) {
    console.log(error?.message || error);
  }
};

// findAll
const findAll = async (query = {}, page, limit, attributes = {}) => {
  const offset = (page - 1) * limit;

  try {
    const result = await product.findAll({
      where: query,
      limit,
      offset,
      attributes,
    });
    return result.toJSON();
  } catch (error) {
    console.log(error?.message || error);
  }
};

// create
const create = async (data) => {
  try {
    const result = await product.create(data);
    return result.toJSON();
  } catch (error) {
    console.log(error?.message || error);
  }
};

// update
const update = async (data, query) => {
  const result = await product.update(data, {
    where: query,
  });

  return result;
};

// destroy
const destroy = async (query) => {
  const result = await product.destroy({
    where: query,
  });

  return result;
};

module.exports = {
  findOne,
  findAll,
  create,
  update,
  destroy,
};
