const Joi = require("joi");

const getVendorDetails = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

const createVendorDetails = {
  body: Joi.object({
    user_id: Joi.number().integer().positive().required(),
    company_name: Joi.string().trim().required(),
    company_email: Joi.string().email().trim().required(),
    company_phone_number: Joi.string().length(10).trim().required(),
    company_city: Joi.string().min(2).max(15).trim().required(),
    company_address: Joi.string().min(5).max(50).trim().required(),
    vendor_status: Joi.string()
      .optional()
      .valid("active", "inactive")
      .default("active"),
  }),
};

module.exports = {
  getVendorDetails,
  createVendorDetails,
};
