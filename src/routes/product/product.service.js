const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const productDb = require("../../dbUtils/productDb");

// generateRandomString
const generateRandomString = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  // Randomly choose length 8 or 9
  const length = Math.floor(Math.random() * 2) + 8;

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// getProducts
const getProducts = async (search, page, limit) => {
  // const t = await sequelize.transaction()
  let query;

  query = {
    status: {
      [Op.eq]: "active",
    },
  };
  if (search) {
    query = {
      ...query,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
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
  let newDataObj;

  if (data?.sku) {
    newDataObj = { ...data };
  } else {
    newDataObj = {
      sku: generateRandomString(),
      ...data,
    };
  }

  const query = {
    sku: {
      [Op.eq]: `${newDataObj?.sku}`,
    },
  };

  const isProductExists = await productDb.findOne(query);

  if (isProductExists) {
    throw new Error("PRODUCT_EXISTS");
  }

  const result = await productDb.create(newDataObj);

  if (!result) {
    throw new Error("PRODUCT_CREATION_FAILED");
  }

  delete result?.created_at;
  delete result?.updated_at;

  return result;
};

// updateProductById
const updateProductById = async (data, id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const isProductExists = await productDb.findOne(query);

  if (!isProductExists) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

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

  return result;
};

// removeProductById
const removeProductById = async (id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const isProductExists = await productDb.findOne(query);

  if (!isProductExists) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const result = await productDb.destroy(query);

  if (result === 0) {
    throw new Error("PRODUCT_REMOVE_FAILED");
  }

  return result;
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  changeProductStatusById,
  removeProductById,
};
