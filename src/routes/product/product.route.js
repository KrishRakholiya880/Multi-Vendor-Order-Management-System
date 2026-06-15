const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const productValidation = require("./product.validation");
const productController = require("./product.controller");
const {
  checkVendorProductOrNot,
  optionalAuth,
  authenticate,
  authorizeRole,
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
    authorizeRole("vendor", "admin"),
    validate(productValidation.createProduct),
    productController.createProduct,
  );

router
  .route("/:id")
  .get(
    productLimiter,
    authenticate,
    validate(productValidation.getProductById),
    productController.getProductById,
  )
  .patch(
    productLimiter,
    authorizeRole("vendor", "admin"),
    checkVendorProductOrNot,
    validate(productValidation.updateProductById),
    productController.updateProductById,
  )
  .delete(
    productLimiter,
    authorizeRole("vendor", "admin"),
    checkVendorProductOrNot,
    validate(productValidation.removeProductById),
    productController.removeProductById,
  );

router
  .route("/changeStatus/:id")
  .patch(
    productLimiter,
    authorizeRole("vendor", "admin"),
    checkVendorProductOrNot,
    validate(productValidation.changeProductStatusById),
    productController.changeProductStatusById,
  );

module.exports = router;
