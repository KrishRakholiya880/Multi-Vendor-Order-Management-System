const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const productValidation = require("./product.validation");
const productController = require("./product.controller");
const {
  isVendorOrAdmin,
  isUserLoggedIn,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(validate(productValidation.getProducts), productController.getProducts)
  .post(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(productValidation.createProduct),
    productController.createProduct,
  );

router
  .route("/:id")
  .get(
    validate(productValidation.getProductById),
    productController.getProductById,
  );

module.exports = router;
