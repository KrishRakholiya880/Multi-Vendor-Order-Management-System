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

const updateCategoryById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().required(),
  }),
};

const removeCategoryById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};

module.exports = {
  createCategory,
  getCategoryById,
  updateCategoryById,
  removeCategoryById,
};
