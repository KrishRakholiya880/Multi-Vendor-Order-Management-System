const Joi = require("joi");

const addToCart = {
  body: Joi.object({
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
  }),
};

const updateProductQuantityById = {
  params: Joi.object({
    product_id: Joi.number().positive().integer().required(),
  }).required(),
  body: Joi.object({
    quantity: Joi.number().positive().integer().required(),
  }),
};

module.exports = {
  addToCart,
  updateProductQuantityById,
};
