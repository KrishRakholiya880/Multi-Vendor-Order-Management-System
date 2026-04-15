const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");

router
  .route("/register")
  .post(validate(authValidation.register), authController.register);
router
  .route("/login")
  .post(validate(authValidation.login), authController.login);
router.route("/logout").post(authController.logout);

module.exports = router;
