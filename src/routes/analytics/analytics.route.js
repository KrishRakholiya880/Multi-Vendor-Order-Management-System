const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const { analyticsLimiter } = require("../../middleware/rateLimiter");
const analyticsValidation = require("./analytics.validation");
const analyticsController = require("./analytics.controller");
const {
  checkVendorProductOrNot,
  authorizeRole,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/vendors-sales-summary")
  .get(
    analyticsLimiter,
    authorizeRole("vendor", "admin"),
    validate(analyticsValidation.getVendorsSalesSummary),
    analyticsController.getVendorsSalesSummary,
  );

router
  .route("/customers-purchase-summary")
  .get(
    analyticsLimiter,
    authorizeRole("customer", "admin"),
    validate(analyticsValidation.getCustomersPurchaseSummary),
    analyticsController.getCustomersPurchaseSummary,
  );

router
  .route("/revenue-trends")
  .get(
    analyticsLimiter,
    authorizeRole("vendor", "admin"),
    validate(analyticsValidation.getRevenue),
    analyticsController.getRevenue,
  );

router
  .route("/product-metrics")
  .get(
    analyticsLimiter,
    authorizeRole("vendor", "admin"),
    validate(analyticsValidation.getProductPerformanceMetrics),
    analyticsController.getProductPerformanceMetrics,
  );

router
  .route("/product-sales-stock-summary")
  .get(
    analyticsLimiter,
    authorizeRole("vendor", "admin"),
    validate(analyticsValidation.getProductSalesStockSummary),
    analyticsController.getProductSalesStockSummary,
  );

router
  .route("/product-metrics/:id")
  .get(
    analyticsLimiter,
    authorizeRole("vendor", "admin"),
    checkVendorProductOrNot,
    validate(analyticsValidation.getProductPerformanceMetricsById),
    analyticsController.getProductPerformanceMetricsById,
  );

router
  .route("/product-sales-stock-summary/:id")
  .get(
    analyticsLimiter,
    authorizeRole("vendor", "admin"),
    checkVendorProductOrNot,
    validate(analyticsValidation.getProductSalesStockSummaryById),
    analyticsController.getProductSalesStockSummaryById,
  );

module.exports = router;
