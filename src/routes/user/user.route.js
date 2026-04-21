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
  )
  .post(
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.createUser),
    userController.createUser,
  );

module.exports = router;
