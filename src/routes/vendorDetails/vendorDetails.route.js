const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const vendorDetailsValidation = require("./vendorDetails.validation");
const vendorDetailsController = require("./vendorDetails.controller");
const {
  isUserLoggedIn,
  isVendor,
  isVendorOrAdmin,
  isAdmin,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(
    isUserLoggedIn,
    isAdmin,
    validate(vendorDetailsValidation.getAllVendorDetails),
    vendorDetailsController.getAllVendorDetails,
  );

router
  .route("/:id")
  .get(
    isUserLoggedIn,
    isAdmin,
    validate(vendorDetailsValidation.getVendorDetailsById),
    vendorDetailsController.getVendorDetailsById,
  )
  .post(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(vendorDetailsValidation.createVendorDetails),
    vendorDetailsController.createVendorDetails,
  )
  .patch(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(vendorDetailsValidation.updateVendorDetailsById),
    vendorDetailsController.updateVendorDetailsById,
  )
  .delete(
    isUserLoggedIn,
    isVendorOrAdmin,
    validate(vendorDetailsValidation.removeVendorDetailsById),
    vendorDetailsController.removeVendorDetailsById,
  );

module.exports = router;
