const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");
const { isUserLoggedIn } = require("../../middleware/authorizationMiddleware");

router
  .route("/register")
  .post(validate(authValidation.register), authController.register);
router
  .route("/login")
  .post(validate(authValidation.login), authController.login);
router.route("/logout").post(authController.logout);
router.route("/refresh").post(authController.refreshToken);
router.route("/profile").get(authController.profile);
router
  .route("/changePassword")
  .patch(
    isUserLoggedIn,
    validate(authValidation.changePassword),
    authController.changePassword,
  );

module.exports = router;
