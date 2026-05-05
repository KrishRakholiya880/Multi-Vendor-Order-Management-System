const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const orderValidation = require("./order.validation");
const orderController = require("./order.controller");
const {
  isUserLoggedIn,
  isVendorOrAdmin,
  isAdminOrCustomer,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(isUserLoggedIn, isAdminOrCustomer, orderController.getOrder)
  .post(isUserLoggedIn, isAdminOrCustomer, orderController.addToOrder);

router
  .route("/vendor-orders")
  .get(isUserLoggedIn, isVendorOrAdmin, orderController.getVendorOrders);

router
  .route("/vendor-orders/:id")
  .patch(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(orderValidation.updateOrderStatusById),
    orderController.updateOrderStatusById,
  );

router
  .route("/:item_id")
  .delete(
    isUserLoggedIn,
    validate(orderValidation.cancelOrderById),
    orderController.cancelOrderById,
  );

module.exports = router;
