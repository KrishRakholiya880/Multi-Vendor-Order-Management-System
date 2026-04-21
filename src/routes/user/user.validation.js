const Joi = require("joi");

const getUsers = {
  query: Joi.object({
    search: Joi.string().trim().optional(),
    page: Joi.number().integer().optional(),
    limit: Joi.number().integer().optional(),
  }),
};

module.exports = {
  getUsers,
};
