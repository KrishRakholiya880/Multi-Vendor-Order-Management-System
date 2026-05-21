const Joi = require("joi");

const queryForPagination = {
  page: Joi.number().integer().positive().optional(),
  limit: Joi.number().integer().positive().optional(),
};

const getVendorsSalesSummary = {
  query: Joi.object({ queryForPagination }),
};

const getCustomersPurchaseSummary = {
  query: Joi.object({ queryForPagination }),
};

const getRevenue = {
  query: Joi.object({
    ...queryForPagination,
    year: Joi.number()
      .integer()
      .min(2000)
      .max(new Date().getFullYear())
      .optional(),
    month: Joi.number().integer().min(1).max(12).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
  }),
};

const getProductPerformanceMetrics = {
  query: Joi.object({ queryForPagination }),
};

const getProductPerformanceMetricsById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const getProductSalesStockSummary = {
  query: Joi.object({
    ...queryForPagination,
    minStock: Joi.number().integer().positive().optional(),
    days: Joi.number().integer().positive().optional(),
  }),
};

const getProductSalesStockSummaryById = {
  query: Joi.object({
    minStock: Joi.number().integer().positive().optional(),
    days: Joi.number().integer().positive().optional(),
  }),
  params: Joi.object({
    productId: Joi.number().integer().positive().optional(),
  }).optional(),
};

module.exports = {
  getVendorsSalesSummary,
  getCustomersPurchaseSummary,
  getRevenue,
  getProductPerformanceMetrics,
  getProductPerformanceMetricsById,
  getProductSalesStockSummary,
  getProductSalesStockSummaryById,
};
