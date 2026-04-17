const { product } = require("../db/models");

// findOne
const findOne = async (query = {}) => {
  try {
    const result = await product.findOne({
      where: query,
    });
    return result;
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
    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = {
  findOne,
  findAll,
};
