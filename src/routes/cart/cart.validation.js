const Joi = require("joi");

const getCart = {
  query: Joi.object({
    page: Joi.number().positive().default(1).optional(),
    limit: Joi.number().positive().default(10).optional(),
  }),
};

const addToCart = {
  body: Joi.object({
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).max(10).required(),
  }),
};

const updateProductQuantityById = {
  params: Joi.object({
    product_id: Joi.number().positive().integer().required(),
  }).required(),
  body: Joi.object({
    quantity: Joi.number().positive().integer().max(10).required(),
  }),
};

const removeCartProductById = {
  params: Joi.object({
    product_id: Joi.number().integer().positive().required(),
  }).required(),
};

module.exports = {
  getCart,
  addToCart,
  updateProductQuantityById,
  removeCartProductById,
};
