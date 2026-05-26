const Joi = require("joi");

const getOrder = {
  query: Joi.object({
    page: Joi.number().integer().positive().optional(),
    limit: Joi.number().integer().positive().optional(),
    status: Joi.string()
      .valid("pending", "full_done", "partially_done", "cancelled")
      .optional(),
    itemStatus: Joi.string()
      .valid("placed", "confirmed", "delivered", "shipped", "cancelled")
      .optional(),
  }),
};

const getVendorOrder = {
  query: Joi.object({
    page: Joi.number().integer().positive().optional(),
    limit: Joi.number().integer().positive().optional(),
    itemStatus: Joi.string()
      .valid("placed", "confirmed", "delivered", "shipped", "cancelled")
      .optional(),
  }),
};

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

const cancelOrderItemById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }).required(),
};

module.exports = {
  getOrder,
  getVendorOrder,
  updateOrderStatusById,
  cancelOrderItemById,
};
