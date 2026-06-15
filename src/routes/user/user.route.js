const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const userValidation = require("./user.validation");
const userController = require("./user.controller");
const { authorizeRole } = require("../../middleware/authorizationMiddleware");
const { adminLimiter } = require("../../middleware/rateLimiter");

router
  .route("/")
  .get(
    adminLimiter,
    authorizeRole("admin"),
    validate(userValidation.getUsers),
    userController.getUsers,
  )
  .post(
    adminLimiter,
    authorizeRole("admin"),
    validate(userValidation.createUser),
    userController.createUser,
  );

router
  .route("/:id")
  .get(
    adminLimiter,
    authorizeRole("admin"),
    validate(userValidation.getUserById),
    userController.getUserById,
  )
  .patch(
    adminLimiter,
    authorizeRole("admin"),
    validate(userValidation.updateUserById),
    userController.updateUserById,
  )
  .delete(
    adminLimiter,
    authorizeRole("admin"),
    validate(userValidation.removeUserById),
    userController.removeUserById,
  );

router
  .route("/changeStatus/:id")
  .patch(
    adminLimiter,
    authorizeRole("admin"),
    validate(userValidation.changeUserStatusById),
    userController.changeUserStatusById,
  );

module.exports = router;
