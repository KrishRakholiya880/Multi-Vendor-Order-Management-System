const Joi = require("joi");

const getAllVendorDetails = {
  query: Joi.object({
    search: Joi.string().trim().optional(),
    status: Joi.string().trim().valid("active", "inactive").optional(),
    sortBy: Joi.string().trim().optional(),
    page: Joi.number().positive().optional(),
    limit: Joi.number().positive().optional(),
  }),
};

const getVendorDetailsById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const createVendorDetails = {
  body: Joi.object({
    user_id: Joi.number().integer().positive().optional(),
    company_name: Joi.string().trim().required(),
    company_email: Joi.string().email().trim().required(),
    company_phone_number: Joi.string().length(10).trim().required(),
    company_city: Joi.string().min(2).max(15).trim().required(),
    company_address: Joi.string().min(5).max(100).trim().required(),
    vendor_status: Joi.string()
      .optional()
      .valid("active", "inactive")
      .default("active"),
  }),
};

const updateVendorDetailsById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }).required(),
  body: Joi.object({
    company_name: Joi.string().trim().optional(),
    company_email: Joi.string().email().trim().optional(),
    company_phone_number: Joi.string().length(10).trim().optional(),
    company_city: Joi.string().min(2).max(15).trim().optional(),
    company_address: Joi.string().min(5).max(50).trim().optional(),
  }).required(),
};

const removeVendorDetailsById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }).required(),
};

module.exports = {
  getAllVendorDetails,
  getVendorDetailsById,
  createVendorDetails,
  updateVendorDetailsById,
  removeVendorDetailsById,
};
