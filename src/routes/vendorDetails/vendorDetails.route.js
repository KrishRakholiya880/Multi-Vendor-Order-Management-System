const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const vendorDetailsValidation = require("./vendorDetails.validation");
const vendorDetailsController = require("./vendorDetails.controller");
const {
  authorizeRole,
  authenticate,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .get(
    authorizeRole("admin"),
    validate(vendorDetailsValidation.getAllVendorDetails),
    vendorDetailsController.getAllVendorDetails,
  )
  .post(
    authorizeRole("vendor", "admin"),
    validate(vendorDetailsValidation.createVendorDetails),
    vendorDetailsController.createVendorDetails,
  );

router
  .route("/:id")
  .get(
    authorizeRole("admin"),
    validate(vendorDetailsValidation.getVendorDetailsById),
    vendorDetailsController.getVendorDetailsById,
  )
  .patch(
    authorizeRole("vendor", "admin"),
    validate(vendorDetailsValidation.updateVendorDetailsById),
    vendorDetailsController.updateVendorDetailsById,
  )
  .delete(
    authorizeRole("vendor", "admin"),
    validate(vendorDetailsValidation.removeVendorDetailsById),
    vendorDetailsController.removeVendorDetailsById,
  );

module.exports = router;
