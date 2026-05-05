const Joi = require("joi");

const getProducts = {
  query: Joi.object({
    search: Joi.string().allow("", null).optional(),
    page: Joi.number().positive().default(1).optional(),
    limit: Joi.number().positive().default(30).optional(),
  }),
};

const createProduct = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    description: Joi.string().trim().min(10).max(200).required(),
    category_id: Joi.number().required(),
    sku: Joi.string().min(8).max(9).optional(),
    status: Joi.string()
      .valid("active", "inactive", "out_of_stock")
      .default("active"),
    vendor_id: Joi.number().precision(2).positive().optional(),
    price: Joi.number().precision(2).positive().required(),
    stock: Joi.number().integer().min(0).positive().default(0),
  }),
};

const getProductById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};

const updateProductById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(3).max(50).optional(),
    description: Joi.string().trim().min(10).max(200).optional(),
    category_id: Joi.number().optional(),
    sku: Joi.string().min(8).max(9).optional(),
    status: Joi.string()
      .valid("active", "inactive", "out_of_stock")
      .default("active"),
    price: Joi.number().precision(2).positive().optional(),
    stock: Joi.number().integer().min(0).positive().default(0),
  }),
};

const changeProductStatusById = {
  body: Joi.object({
    status: Joi.string().valid("active", "inactive", "out_of_stock").required(),
  }),
};

const removeProductById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  changeProductStatusById,
  removeProductById,
};
