const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const orderValidation = require("./order.validation");
const orderController = require("./order.controller");
const {
  authorizeRole,
  authenticate,
} = require("../../middleware/authorizationMiddleware");
const { orderLimiter } = require("../../middleware/rateLimiter");

router
  .route("/")
  .get(
    orderLimiter,
    authorizeRole("customer", "admin"),
    validate(orderValidation.getOrder),
    orderController.getOrder,
  )
  .post(
    orderLimiter,
    authorizeRole("customer", "admin"),
    orderController.addToOrder,
  );

router
  .route("/vendor-orders")
  .get(
    authorizeRole("vendor", "admin"),
    validate(orderValidation.getVendorOrder),
    orderController.getVendorOrders,
  );

router
  .route("/vendor-orders/:id")
  .patch(
    orderLimiter,
    authorizeRole("vendor", "admin"),
    validate(orderValidation.updateOrderStatusById),
    orderController.updateOrderStatusById,
  );

router
  .route("/:id")
  .delete(
    authenticate,
    validate(orderValidation.cancelOrderItemById),
    orderController.cancelOrderItemById,
  );

module.exports = router;
