const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const cartValidation = require("./cart.validation");
const cartController = require("./cart.controller");
const {
  isUserLoggedIn,
  isCustomer,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(isUserLoggedIn, cartController.getCart)
  .post(
    isUserLoggedIn,
    validate(cartValidation.addToCart),
    cartController.addToCart,
  );

router
  .route("/:product_id")
  .patch(
    isUserLoggedIn,
    isCustomer,
    validate(cartValidation.updateProductQuantityById),
    cartController.updateProductQuantityById,
  );

module.exports = router;
