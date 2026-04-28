const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const orderValidation = require("./order.validation");
const orderController = require("./order.controller");
const {
  isUserLoggedIn,
  isCustomer,
  isVendor,
  isVendorOrAdmin,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(isUserLoggedIn, orderController.getOrder)
  .post(isUserLoggedIn, isCustomer, orderController.addToOrder);

router
  .route("/vendor-orders")
  .get(isUserLoggedIn, isVendorOrAdmin, orderController.getVendorOrders);

module.exports = router;
