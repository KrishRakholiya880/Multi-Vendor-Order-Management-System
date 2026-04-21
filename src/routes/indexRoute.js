const express = require("express");

const router = express.Router();

const authRoute = require("./auth/auth.route");
const productsRoute = require("./product/product.route");
const categoriesRoute = require("./category/category.route");

router.use("/auth", authRoute);
router.use("/products", productsRoute);
router.use("/categories", categoriesRoute);

module.exports = router;
