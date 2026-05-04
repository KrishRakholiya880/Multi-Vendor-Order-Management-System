const Joi = require("joi");

const updateOrderStatusById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid("confirmed", "shipped", "delivered", "cancelled")
      .required(),
  }),
};

module.exports = {
  updateOrderStatusById,
};
