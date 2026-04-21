const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const productValidation = require("./product.validation");
const productController = require("./product.controller");
const {
  isVendorOrAdmin,
  isUserLoggedIn,
  checkVendorProductOrNot,
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
  )
  .patch(
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(productValidation.updateProductById),
    productController.updateProductById,
  )
  .delete(
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(productValidation.removeProductById),
    productController.removeProductById,
  );

router
  .route("/changeStatus/:id")
  .patch(
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(productValidation.changeProductStatusById),
    productController.changeProductStatusById,
  );

module.exports = router;
