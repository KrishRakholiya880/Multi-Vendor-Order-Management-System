const Joi = require("joi");

const register = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
    phone_number: Joi.string().length(10).optional(),
    is_active: Joi.boolean().optional().default(true),
  }),
};
const login = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
  }),
};

module.exports = {
  register,
  login,
};
