const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const userValidation = require("./user.validation");
const userController = require("./user.controller");
const {
  isUserLoggedIn,
  isAdmin,
} = require("../../middleware/authorizationMiddleware");
const { adminLimiter } = require("../../middleware/rateLimiter");

router
  .route("/")
  .get(
    adminLimiter,
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.getUsers),
    userController.getUsers,
  )
  .post(
    adminLimiter,
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.createUser),
    userController.createUser,
  );

router
  .route("/:id")
  .get(
    adminLimiter,
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.getUserById),
    userController.getUserById,
  )
  .patch(
    adminLimiter,
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.updateUserById),
    userController.updateUserById,
  )
  .delete(
    adminLimiter,
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.removeUserById),
    userController.removeUserById,
  );

router
  .route("/changeStatus/:id")
  .patch(
    adminLimiter,
    isUserLoggedIn,
    isAdmin,
    validate(userValidation.changeUserStatusById),
    userController.changeUserStatusById,
  );

module.exports = router;
