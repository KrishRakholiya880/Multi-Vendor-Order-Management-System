const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const userValidation = require("./user.validation");
const userController = require("./user.controller");
const {
  isVendorOrAdmin,
  isUserLoggedIn,
  checkVendorProductOrNot,
  isAdmin,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.getUsers),
    userController.getUsers,
  );
// router
//   .route("/login")
//   .post(validate(userValidation.login), userController.login);
// router.route("/logout").post(userController.logout);
// router.route("/refresh").post(userController.refreshToken);
// router.route("/profile").get(userController.profile);

module.exports = router;
