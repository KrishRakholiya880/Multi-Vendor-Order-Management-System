const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const { analyticsLimiter } = require("../../middleware/rateLimiter");
const analyticsValidation = require("./analytics.validation");
const analyticsController = require("./analytics.controller");
const {
  isUserLoggedIn,
  isVendorOrAdmin,
  isAdminOrCustomer,
  checkVendorProductOrNot,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/vendors-sales-summary")
  .get(
    analyticsLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getVendorsSalesSummary),
    analyticsController.getVendorsSalesSummary,
  );

router
  .route("/customers-purchase-summary")
  .get(
    analyticsLimiter,
    isUserLoggedIn,
    isAdminOrCustomer,
    validate(analyticsValidation.getCustomersPurchaseSummary),
    analyticsController.getCustomersPurchaseSummary,
  );

router
  .route("/revenue-trends")
  .get(
    analyticsLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getRevenue),
    analyticsController.getRevenue,
  );

router
  .route("/product-metrics")
  .get(
    analyticsLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getProductPerformanceMetrics),
    analyticsController.getProductPerformanceMetrics,
  );

router
  .route("/product-sales-stock-summary")
  .get(
    analyticsLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getProductSalesStockSummary),
    analyticsController.getProductSalesStockSummary,
  );

router
  .route("/product-metrics/:id")
  .get(
    analyticsLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(analyticsValidation.getProductPerformanceMetricsById),
    analyticsController.getProductPerformanceMetricsById,
  );

router
  .route("/product-sales-stock-summary/:id")
  .get(
    analyticsLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(analyticsValidation.getProductSalesStockSummaryById),
    analyticsController.getProductSalesStockSummaryById,
  );

module.exports = router;
