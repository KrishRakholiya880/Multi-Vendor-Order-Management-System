const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const vendorDetailsValidation = require("./vendorDetails.validation");
const vendorDetailsController = require("./vendorDetails.controller");
const {
  isUserLoggedIn,
  isVendor,
  isVendorOrAdmin,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(
    isUserLoggedIn,
    isVendorOrAdmin,
    // validate(vendorDetailsValidation.getVendorDetails),
    vendorDetailsController.getAllVendorDetails,
  )
  .post(
    isUserLoggedIn,
    isVendor,
    validate(vendorDetailsValidation.createVendorDetails),
    vendorDetailsController.createVendorDetails,
  );

module.exports = router;
