const Joi = require("joi");

const addToCart = {
  body: Joi.object({
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
  }),
};

module.exports = {
  addToCart,
};
