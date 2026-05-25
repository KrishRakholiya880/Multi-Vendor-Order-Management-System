const rateLimit = require("express-rate-limit");
const windowMs = 1 * 60 * 1000;
const message = {
  code: "too_many_requests",
  message: "Too many attempts, please try again after 1 minute!!!",
};

const authLimiter = rateLimit({
  windowMs,
  max: 5,
  message,
});

const productLimiter = rateLimit({
  windowMs,
  max: 10,
  message,
});

const cartLimiter = rateLimit({
  windowMs,
  max: 10,
  message,
});

const orderLimiter = rateLimit({
  windowMs,
  max: 10,
  message,
});

const adminLimiter = rateLimit({
  windowMs,
  max: 10,
  message,
});

const analyticsLimiter = rateLimit({
  windowMs,
  max: 10,
  message,
});

module.exports = {
  authLimiter,
  productLimiter,
  cartLimiter,
  orderLimiter,
  adminLimiter,
  analyticsLimiter,
};
