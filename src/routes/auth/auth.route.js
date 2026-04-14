const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");

router
  .route("/register")
  .post(validate(authValidation.register), authController.register);

module.exports = router;
