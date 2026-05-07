const { decodeToken } = require("../helper/authHelper");
const authDb = require("../dbUtils/authDb");
const productDb = require("../dbUtils/productDb");
const refreshTokenDb = require("../dbUtils/refreshTokenDb");

const optionalAuth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    req.user = null;
    return next();
  }

  const decodedData = decodeToken(accessToken);
  if (!decodedData) {
    req.user = null;
    return next();
  }

  const userData = await authDb.findOne({ id: decodedData?.id });
  req.user = userData;
  next();
};

const isUserLoggedIn = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    throw new Error("TOKEN_REQUIRED");
  }

  const tokenData = await refreshTokenDb.findOne({ token: refreshToken });
  if (!tokenData || new Date() > new Date(tokenData?.expires_at)) {
    throw new Error("SESSION_EXPIRED");
  }

  const decodedData = decodeToken(accessToken);

  if (!decodedData) {
    throw new Error("INVALID_ACCESS_TOKEN");
  }

  const userData = await authDb.findOne({ id: decodedData?.id }, [
    "id",
    "full_name",
    "email",
    "phone_number",
    "status",
    "role",
  ]);

  if (!userData) {
    throw new Error("USER_NOT_FOUND");
  }

  req.user = userData;
  next();
};

const isAdmin = (req, res, next) => {
  const role = req.user?.role;

  if (role === "admin") {
    return next();
  }

  throw new Error("ONLY_ADMIN_ACCESS");
};

const isVendor = (req, res, next) => {
  const role = req.user?.role;

  if (role === "vendor") {
    return next();
  }

  throw new Error("ONLY_VENDOR_ACCESS");
};

const isCustomer = (req, res, next) => {
  const role = req.user?.role;

  if (role === "customer") {
    return next();
  }

  throw new Error("ONLY_CUSTOMERS_ACCESS");
};

const isVendorOrAdmin = async (req, res, next) => {
  const role = req.user?.role;

  if (role === "admin" || role === "vendor") {
    return next();
  }

  throw new Error("ACCESS_DENIED");
};

const isAdminOrCustomer = async (req, res, next) => {
  const role = req.user?.role;

  if (role === "customer" || role === "admin") {
    return next();
  }

  throw new Error("ACCESS_DENIED");
};

const checkVendorProductOrNot = async (req, res, next) => {
  const user = req.user;
  const role = req.user?.role;
  if (role === "vendor") {
    const { id } = req.params;

    const product = await productDb.findOne({ id: id });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (product?.vendor_id !== user?.id) {
      throw new Error("ACCESS_DENIED_FOR_PRODUCT");
    }

    next();
  } else {
    next();
  }
};

module.exports = {
  optionalAuth,
  isUserLoggedIn,
  isAdmin,
  isVendor,
  isCustomer,
  isVendorOrAdmin,
  isAdminOrCustomer,
  checkVendorProductOrNot,
};
