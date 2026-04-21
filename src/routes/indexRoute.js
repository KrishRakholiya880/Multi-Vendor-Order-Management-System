const express = require("express");

const router = express.Router();

const authRoute = require("./auth/auth.route");
const productsRoute = require("./product/product.route");

router.use("/auth", authRoute);
router.use("/products", productsRoute);

module.exports = router;
