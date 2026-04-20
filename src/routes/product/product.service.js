const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const productDb = require("../../dbUtils/productDb");

// getProducts
const getProducts = async (search, page, limit) => {
  // const t = await sequelize.transaction()
  let query;
  if (search) {
    const cleanSearch = search.replace(/^"|"$/g, "");

    query = {
      [Op.or]: [
        { name: { [Op.like]: `%${cleanSearch}%` } },
        { description: { [Op.like]: `%${cleanSearch}%` } },
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
    throw new Error("PRODUCT_CREATION_FAILED");
  }

  return result;
};

// updateProduct
const updateProduct = async (data, id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const result = await productDb.update(data, query);

  if (!result) {
    throw new Error("PRODUCT_UPDATE_FAILED");
  }

  return result;
};

// changeProductStatusById
const changeProductStatusById = async (id, status) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const isProductExists = await productDb.findOne(query);

  if (!isProductExists) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  if (isProductExists?.status === status) {
    throw new Error("PRODUCT_UPDATE_STATUS_FAILED");
  }

  const result = await productDb.update({ status: status }, query);

  if (result === 0) {
    throw new Error("PRODUCT_UPDATE_FAILED");
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  changeProductStatusById,
};
