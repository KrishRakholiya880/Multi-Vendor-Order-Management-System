const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const vendorDetailsValidation = require("./vendorDetails.validation");
const vendorDetailsController = require("./vendorDetails.controller");
const {
  isUserLoggedIn,
  isVendor,
} = require("../../middleware/authorizationMiddleware");

router
  .route("/")
  .post(
    isUserLoggedIn,
    isVendor,
    validate(vendorDetailsValidation.createVendorDetails),
    vendorDetailsController.createVendorDetails,
  );
// router
//   .route("/login")
//   .post(validate(vendorDetailsValidation.login), vendorDetailsController.login);
// router.route("/logout").post(vendorDetailsController.logout);
// router.route("/refresh").post(vendorDetailsController.refreshToken);
// router.route("/profile").get(vendorDetailsController.profile);
// router
//   .route("/changePassword")
//   .patch(
//     isUserLoggedIn,
//     validate(vendorDetailsValidation.changePassword),
//     vendorDetailsController.changePassword,
//   );

module.exports = router;
