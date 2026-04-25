const express = require("express");

const router = express.Router();

const validate = require("../../middleware/validate");
const cartValidation = require("./cart.validation");
const cartController = require("./cart.controller");
const { isUserLoggedIn } = require("../../middleware/authorizationMiddleware");

router.route("/").get(isUserLoggedIn, cartController.getCart);

module.exports = router;
