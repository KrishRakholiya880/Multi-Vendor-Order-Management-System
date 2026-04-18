const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const productValidation = require("./product.validation");
const authController = require("./product.controller");
const {
  isVendorOrAdmin,
  isUserLoggedIn,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(
    isUserLoggedIn,
    validate(productValidation.getProducts),
    authController.getProducts,
  )
  .post(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(productValidation.createProduct),
    authController.createProduct,
  );

module.exports = router;
