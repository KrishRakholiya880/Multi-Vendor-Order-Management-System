const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");
const { authenticate } = require("../../middleware/authorizationMiddleware");
const { authLimiter } = require("../../middleware/rateLimiter");

router
  .route("/register")
  .post(
    authLimiter,
    validate(authValidation.register),
    authController.register,
  );

router
  .route("/login")
  .post(authLimiter, validate(authValidation.login), authController.login);

router.route("/logout").post(authLimiter, authController.logout);

router
  .route("/refresh")
  .post(authLimiter, authenticate, authController.renewAccessToken);

router.route("/profile").get(authLimiter, authenticate, authController.profile);

router
  .route("/changePassword")
  .patch(
    authLimiter,
    authenticate,
    validate(authValidation.changePassword),
    authController.changePassword,
  );

module.exports = router;
