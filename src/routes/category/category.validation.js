const Joi = require("joi");

const createCategory = {
  body: Joi.object({
    name: Joi.string().trim().required(),
  }),
};

const getCategoryById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};

const updateProductById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().required(),
  }),
};

const removeProductById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};

module.exports = {
  createCategory,
  getCategoryById,
  updateProductById,
  removeProductById,
};
