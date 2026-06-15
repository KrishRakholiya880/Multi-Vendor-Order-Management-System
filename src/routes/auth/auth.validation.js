const Joi = require("joi");

const register = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .max(32)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
        "any.required": "Password is required",
      }),
    phone_number: Joi.string().length(10).required(),
    role: Joi.string()
      .valid("vendor", "customer")
      .default("customer")
      .optional(),
    status: Joi.string().optional().default("active"),
  }).required(),
};
const login = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
  }).required(),
};

const changePassword = {
  body: Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().required(),
    confirm_password: Joi.string().valid(Joi.ref("new_password")).required(),
  }),
};

module.exports = {
  register,
  login,
  changePassword,
};
