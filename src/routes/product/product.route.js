const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const productValidation = require("./product.validation");
const productController = require("./product.controller");
const {
  isVendorOrAdmin,
  isUserLoggedIn,
  checkVendorProductOrNot,
  optionalAuth,
} = require("../../middleware/authorizationMiddleware");
const { productLimiter } = require("../../middleware/rateLimiter");

router
  .route("/")
  .get(
    productLimiter,
    optionalAuth,
    validate(productValidation.getProducts),
    productController.getProducts,
  )
  .post(
    productLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(productValidation.createProduct),
    productController.createProduct,
  );

router
  .route("/:id")
  .get(
    productLimiter,
    isUserLoggedIn,
    validate(productValidation.getProductById),
    productController.getProductById,
  )
  .patch(
    productLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(productValidation.updateProductById),
    productController.updateProductById,
  )
  .delete(
    productLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(productValidation.removeProductById),
    productController.removeProductById,
  );

router
  .route("/changeStatus/:id")
  .patch(
    productLimiter,
    isUserLoggedIn,
    isVendorOrAdmin,
    checkVendorProductOrNot,
    validate(productValidation.changeProductStatusById),
    productController.changeProductStatusById,
  );

module.exports = router;
