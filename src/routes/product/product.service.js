const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const productDb = require("../../dbUtils/productDb");
const { category, user, vendor_detail } = require("../../db/models");

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
const getProducts = async (
  userData,
  search,
  sortBy,
  priceSort,
  categoryId,
  page,
  limit,
) => {
  let query = {};
  let result;

  if (categoryId) {
    query = {
      ...query,
      category_id: { [Op.eq]: `${categoryId}` },
    };
  }
  const include = [
    { model: category, as: "category", attributes: ["id", "name"] },
  ];
  const attributes = [
    "id",
    "name",
    "description",
    "category_id",
    "vendor_id",
    "status",
    "stock",
    "price",
  ];

  if (userData?.role === "vendor") {
    query = {
      vendor_id: { [Op.eq]: `${userData?.id}` },
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

    result = await productDb.findAll(
      query,
      page,
      limit,
      attributes,
      include,
      sortBy,
      priceSort,
      category,
    );
  } else {
    if (userData?.role === "customer") {
      query = { status: { [Op.eq]: "active" } };
    }

    if (search) {
      query = {
        ...query,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (userData?.role === "admin") {
      include.push({
        model: user,
        as: "vendor",
        attributes: ["id", "full_name", "email"],
        include: [
          {
            model: vendor_detail,
            as: "vendor_detail",
            attributes: ["company_name", "company_email", "company_city"],
          },
        ],
      });
    }

    result = await productDb.findAll(
      query,
      page,
      limit,
      attributes,
      include,
      sortBy,
      priceSort,
      category,
    );
  }

  if (!result || (Array.isArray(result) && result.length === 0)) {
    throw new Error("PRODUCTS_NOT_FOUND");
  }

  return result;
};

// getProductById
const getProductById = async (userData, id) => {
  const query = { id: { [Op.eq]: `${id}` } };
  const attributes = [
    "id",
    "name",
    "description",
    "category_id",
    "vendor_id",
    "status",
    "price",
    "stock",
  ];
  const include = [
    { model: category, as: "category", attributes: ["id", "name"] },
  ];

  if (userData?.role === "admin") {
    include.push({
      model: user,
      as: "vendor",
      attributes: ["id", "full_name", "email"],
      include: [
        {
          model: vendor_detail,
          as: "vendor_detail",
          attributes: ["company_name", "company_email", "company_city"],
        },
      ],
    });
  }

  const result = await productDb.findOne(query, attributes, include);

  if (!result) throw new Error("PRODUCT_NOT_FOUND");

  return result;
};

// createProduct
const createProduct = async (userData, data) => {
  if (userData?.role === "admin" && !data?.vendor_id) {
    throw new Error("VENDOR_ID_REQUIRED");
  }

  const vendor_id =
    userData?.role === "vendor" ? userData?.id : data?.vendor_id;
  const sku = data?.sku || generateRandomString();

  const isProductExists = await productDb.findOne({
    sku: { [Op.eq]: `${sku}` },
  });

  if (isProductExists) throw new Error("PRODUCT_EXISTS");

  const newDataObj = { ...data, sku, vendor_id };
  const result = await productDb.create(newDataObj);

  delete result?.created_at;
  delete result?.updated_at;

  return result;
};

// updateProductById
const updateProductById = async (data, id) => {
  const query = { id: { [Op.eq]: `${id}` } };

  const isProductExists = await productDb.findOne(query);
  if (!isProductExists) throw new Error("PRODUCT_NOT_FOUND");

  const result = await productDb.update(data, query);

  return result;
};

// changeProductStatusById
const changeProductStatusById = async (id, status) => {
  const query = { id: { [Op.eq]: `${id}` } };

  const isProductExists = await productDb.findOne(query);
  if (!isProductExists) throw new Error("PRODUCT_NOT_FOUND");

  if (isProductExists?.status === status) {
    throw new Error("PRODUCT_UPDATE_STATUS_FAILED");
  }

  const result = await productDb.update({ status }, query);

  return result;
};

// removeProductById
const removeProductById = async (id) => {
  const query = { id: { [Op.eq]: `${id}` } };

  const isProductExists = await productDb.findOne(query);
  if (!isProductExists) throw new Error("PRODUCT_NOT_FOUND");

  const result = await productDb.remove(query);

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
