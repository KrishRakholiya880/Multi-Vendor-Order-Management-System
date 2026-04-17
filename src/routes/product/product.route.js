const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const productValidation = require("./product.validation");
const authController = require("./product.controller");

router
  .route("/")
  .get(validate(productValidation.getProducts), authController.getProducts);

module.exports = router;
