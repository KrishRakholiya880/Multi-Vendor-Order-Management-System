const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const categoryValidation = require("./category.validation");
const categoryController = require("./category.controller");
const {
  optionalAuth,
  authorizeRole,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(optionalAuth, categoryController.getCategories)
  .post(
    authorizeRole("admin"),
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
    authorizeRole("admin"),
    validate(categoryValidation.updateCategoryById),
    categoryController.updateCategoryById,
  )
  .delete(
    authorizeRole("admin"),
    validate(categoryValidation.removeCategoryById),
    categoryController.removeCategoryById,
  );

module.exports = router;
