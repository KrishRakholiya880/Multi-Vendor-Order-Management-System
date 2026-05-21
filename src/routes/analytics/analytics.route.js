const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
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
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getVendorsSalesSummary),
    analyticsController.getVendorsSalesSummary,
  );

router
  .route("/customers-purchase-summary")
  .get(
    isUserLoggedIn,
    isAdminOrCustomer,
    validate(analyticsValidation.getCustomersPurchaseSummary),
    analyticsController.getCustomersPurchaseSummary,
  );

router
  .route("/revenue")
  .get(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getRevenue),
    analyticsController.getRevenue,
  );

router
  .route("/product-metrics")
  .get(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getProductPerformanceMetrics),
    analyticsController.getProductPerformanceMetrics,
  );

router
  .route("/product-sales-stock-summary")
  .get(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(analyticsValidation.getProductSalesStockSummary),
    analyticsController.getProductSalesStockSummary,
  );

router
  .route("/product-metrics/:id")
  .get(
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(analyticsValidation.getProductPerformanceMetricsById),
    analyticsController.getProductPerformanceMetricsById,
  );

router
  .route("/product-sales-stock-summary/:productId")
  .get(
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(analyticsValidation.getProductSalesStockSummaryById),
    analyticsController.getProductSalesStockSummaryById,
  );

module.exports = router;
