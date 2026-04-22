const express = require("express");

const router = express.Router();

const authRoute = require("./auth/auth.route");
const userRoute = require("./user/user.route.js");
const productsRoute = require("./product/product.route");
const categoriesRoute = require("./category/category.route");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/products", productsRoute);
router.use("/categories", categoriesRoute);

module.exports = router;
