const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const cartValidation = require("./cart.validation");
const cartController = require("./cart.controller");
const {
  isUserLoggedIn,
  isCustomer,
  isAdminOrCustomer,
} = require("../../middleware/authorizationMiddleware");
const { cartLimiter } = require("../../middleware/rateLimiter");

router
  .route("/")
  .get(cartLimiter, isUserLoggedIn, isAdminOrCustomer, cartController.getCart)
  .post(
    cartLimiter,
    isUserLoggedIn,
    isAdminOrCustomer,
    validate(cartValidation.addToCart),
    cartController.addToCart,
  );

router
  .route("/clear")
  .post(isUserLoggedIn, isAdminOrCustomer, cartController.clearCart);

router
  .route("/:product_id")
  .patch(
    cartLimiter,
    isUserLoggedIn,
    isAdminOrCustomer,
    validate(cartValidation.updateProductQuantityById),
    cartController.updateProductQuantityById,
  )
  .delete(
    cartLimiter,
    isUserLoggedIn,
    isAdminOrCustomer,
    validate(cartValidation.removeCartProductById),
    cartController.removeCartProductById,
  );

module.exports = router;
