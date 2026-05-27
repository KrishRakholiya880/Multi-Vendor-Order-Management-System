const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const categoryValidation = require("./category.validation");
const categoryController = require("./category.controller");
const {
  isVendorOrAdmin,
  isUserLoggedIn,
  checkVendorProductOrNot,
  isAdmin,
  optionalAuth,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(optionalAuth, categoryController.getCategories)
  .post(
    isUserLoggedIn,
    isAdmin,
    validate(categoryValidation.createCategory),
    categoryController.createCategory,
  );

router
  .route("/:id")
  .get(
    optionalAuth,
    validate(categoryValidation.getCategoryById),
    categoryController.getCategoryById,
  )
  .patch(
    isUserLoggedIn,
    isAdmin,
    validate(categoryValidation.updateCategoryById),
    categoryController.updateCategoryById,
  )
  .delete(
    isUserLoggedIn,
    isAdmin,
    validate(categoryValidation.removeCategoryById),
    categoryController.removeCategoryById,
  );

module.exports = router;
