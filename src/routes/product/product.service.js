const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const productDb = require("../../dbUtils/productDb");

// getProducts
const getProducts = async (search, page = 1, limit = 30) => {
  // const t = await sequelize.transaction()
  let query;
  if (search) {
    query = {
      [Op.or]: [
        { name: { [Op.like]: `${search}` } },
        { description: { [Op.like]: `${search}` } },
      ],
    };
  }

  const result = await productDb.findAll(query, page, limit, [
    "id",
    "name",
    "description",
    ["category_id", "category"],
    ["vendor_id", "vendor"],
    "status",
  ]);

  if (!result || (Array.isArray(result) && result.length === 0)) {
    throw new Error("PRODUCTS_NOT_FOUND");
  }

  return result;
};

// getProductById
const getProductById = async (id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const result = await productDb.findOne(query, [
    "id",
    "name",
    "description",
    ["category_id", "category"],
    ["vendor_id", "vendor"],
    "status",
  ]);

  if (!result) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return result;
};

// createProduct
const createProduct = async (data) => {
  const result = productDb.create(data);

  if (!result) {
    throw new Error("Error while add product!!!");
  }

  return result;
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
