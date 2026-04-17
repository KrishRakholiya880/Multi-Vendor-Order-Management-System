const Joi = require("joi");

const getProducts = {
  params: Joi.object({
    search: Joi.string().optional(),
    page: Joi.number().positive().default(1).optional(),
    limit: Joi.number().positive().default(30).optional(),
  }),
};

module.exports = {
  getProducts,
};
