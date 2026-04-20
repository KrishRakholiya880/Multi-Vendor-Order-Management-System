const Joi = require("joi");

const getProducts = {
  params: Joi.object({
    search: Joi.string().optional(),
    page: Joi.number().positive().default(1).optional(),
    limit: Joi.number().positive().default(30).optional(),
  }),
};

const createProduct = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    description: Joi.string().trim().min(10).max(200).required(),
    category_id: Joi.number().required(),
    status: Joi.string()
      .valid("active", "inactive", "out_of_stock")
      .default("active"),
    price: Joi.number().precision(2).positive().required(),
    stock: Joi.number().integer().min(0).positive().default(0),
  }),
};

const getProductById = {
  params: Joi.object({
    id: Joi.number().integer().optional(),
  }),
};

const updateProduct = {
  params: Joi.object({
    id: Joi.number().integer().optional(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(3).max(50).optional(),
    description: Joi.string().trim().min(10).max(200).optional(),
    category_id: Joi.number().optional(),
    status: Joi.string()
      .valid("active", "inactive", "out_of_stock")
      .default("active"),
    price: Joi.number().precision(2).positive().optional(),
    stock: Joi.number().integer().min(0).positive().default(0),
  }),
};

const changeProductStatus = {
  body: Joi.object({
    status: Joi.string().valid("active", "inactive", "out_of_stock").required(),
  }),
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  changeProductStatus,
};
