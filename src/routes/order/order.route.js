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
const { orderLimiter } = require("../../middleware/rateLimiter");

router
  .route("/")
  .get(
    orderLimiter,
    isUserLoggedIn,
    isAdminOrCustomer,
    validate(orderValidation.getOrder),
    orderController.getOrder,
  )
  .post(
    orderLimiter,
    isUserLoggedIn,
    isAdminOrCustomer,
    orderController.addToOrder,
  );

router
  .route("/vendor-orders")
  .get(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(orderValidation.getVendorOrder),
    orderController.getVendorOrders,
  );

router
  .route("/vendor-orders/:id")
  .patch(
    orderLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(orderValidation.updateOrderStatusById),
    orderController.updateOrderStatusById,
  );

router
  .route("/:item_id")
  .delete(
    isUserLoggedIn,
    validate(orderValidation.cancelOrderItemById),
    orderController.cancelOrderItemById,
  );

module.exports = router;
