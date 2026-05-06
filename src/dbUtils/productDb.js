const { product, category } = require("../db/models");

// findOne
const findOne = async (query = {}, attributes = {}, include = []) => {
  try {
    const result = await product.findOne({
      where: query,
      attributes,
      ...(include.length > 0 && { include }),
    });
    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// findAll
const findAll = async (
  query = {},
  page,
  limit,
  attributes = {},
  include,
  sortBy,
  priceSort,
) => {
  const offset = (page - 1) * limit;
  const order = [];

  if (sortBy) {
    order.push(["created_at", sortBy === "asc" ? "ASC" : "DESC"]);
  }

  if (priceSort) {
    order.push(["price", priceSort === "asc" ? "ASC" : "DESC"]);
  }

  try {
    const result = await product.findAll({
      where: query,
      limit,
      offset,
      attributes,
      ...(include.length > 0 && { include }),
      order,
    });
    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// create
const create = async (data) => {
  try {
    const result = await product.create(data);
    return result.toJSON() || null;
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

// remove
const remove = async (query) => {
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
  remove,
};
