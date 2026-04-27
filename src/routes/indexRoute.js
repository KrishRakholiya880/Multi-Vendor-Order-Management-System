const express = require("express");

const router = express.Router();

const authRoute = require("./auth/auth.route");
const userRoute = require("./user/user.route");
const vendorDetailsRoute = require("./vendorDetails/vendorDetails.route");
const productsRoute = require("./product/product.route");
const categoriesRoute = require("./category/category.route");
const cartRoute = require("./cart/cart.route");
const orderRoute = require("./order/order.route");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/vendor-details", vendorDetailsRoute);
router.use("/products", productsRoute);
router.use("/categories", categoriesRoute);
router.use("/cart", cartRoute);
router.use("/order", orderRoute);

module.exports = router;
