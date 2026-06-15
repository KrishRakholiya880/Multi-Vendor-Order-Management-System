const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const cartValidation = require("./cart.validation");
const cartController = require("./cart.controller");
const {
  authenticate,
  authorizeRole,
} = require("../../middleware/authorizationMiddleware");
const { cartLimiter } = require("../../middleware/rateLimiter");

router
  .route("/")
  .get(
    cartLimiter,
    authenticate,
    validate(cartValidation.getCart),
    cartController.getCart,
  )
  .post(
    cartLimiter,
    authorizeRole("customer", "admin"),
    validate(cartValidation.addToCart),
    cartController.addToCart,
  );

router
  .route("/clear")
  .post(authorizeRole("customer", "admin"), cartController.clearCart);

router
  .route("/:product_id")
  .patch(
    cartLimiter,
    authorizeRole("customer", "admin"),
    validate(cartValidation.updateProductQuantityById),
    cartController.updateProductQuantityById,
  )
  .delete(
    cartLimiter,
    authorizeRole("customer", "admin"),
    validate(cartValidation.removeCartProductById),
    cartController.removeCartProductById,
  );

module.exports = router;
