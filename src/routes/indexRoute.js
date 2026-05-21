const express = require("express");

const router = express.Router();

const authRoute = require("./auth/auth.route");
const userRoute = require("./user/user.route");
const vendorDetailsRoute = require("./vendorDetails/vendorDetails.route");
const productsRoute = require("./product/product.route");
const categoriesRoute = require("./category/category.route");
const cartRoute = require("./cart/cart.route");
const orderRoute = require("./order/order.route");
const analyticsRoute = require("./analytics/analytics.route");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/vendor-details", vendorDetailsRoute);
router.use("/products", productsRoute);
router.use("/categories", categoriesRoute);
router.use("/carts", cartRoute);
router.use("/orders", orderRoute);
router.use("/analytics", analyticsRoute);

module.exports = router;
