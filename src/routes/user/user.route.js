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

router
  .route("/:id")
  .get(
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.getUserById),
    userController.getUserById,
  )
  .patch(
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.updateUserById),
    userController.updateUserById,
  )
  .delete(
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.removeUserById),
    userController.removeUserById,
  );

router
  .route("/changeStatus/:id")
  .patch(
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.changeUserStatusById),
    userController.changeUserStatusById,
  );

module.exports = router;
