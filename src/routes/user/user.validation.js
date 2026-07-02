const Joi = require("joi");

const getUsers = {
  query: Joi.object({
    search: Joi.string().trim().optional(),
    role: Joi.string().trim().optional(),
    status: Joi.string().trim().valid("active", "inactive").optional(),
    sortBy: Joi.string().trim().optional(),
    from_date: Joi.date().iso().optional(),
    to_date: Joi.date().iso().optional(),
    page: Joi.number().integer().optional(),
    limit: Joi.number().integer().optional(),
  })
    .optional()
    .custom((value, helpers) => {
      if (
        value.from_date &&
        value.to_date &&
        new Date(value.to_date) < new Date(value.from_date)
      ) {
        return helpers.error("any.invalid", {
          message: "to_date must be after from_date",
        });
      }
      return value;
    }),
};

const getUserById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }).required(),
};

const createUser = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
    phone_number: Joi.string().length(10).required(),
    status: Joi.string().valid("active", "inactive").optional(),
  }).required(),
};

const updateUserById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }).required(),
  body: Joi.object({
    full_name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).max(15).optional(),
    phone_number: Joi.string().length(10).optional(),
    role: Joi.string()
      .optional()
      .valid("vendor", "customer", "admin")
      .default("customer"),
    status: Joi.string()
      .optional()
      .valid("active", "inactive")
      .default("active"),
  }).required(),
};

const changeUserStatusById = {
  body: Joi.object({
    status: Joi.string().valid("active", "inactive").required(),
  }),
};

const removeUserById = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }).required(),
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  removeUserById,
  changeUserStatusById,
};
