const { decodeToken } = require("../helper/authHelper");
const authDb = require("../dbUtils/authDb");
const productDb = require("../dbUtils/productDb");

const isUserLoggedIn = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new Error("TOKEN_REQUIRED");
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
    "is_active",
    "role",
  ]);

  if (!userData) {
    throw new Error("USER_NOT_FOUND");
  }

  req.user = userData;
  next();
};

const isVendorOrAdmin = async (req, res, next) => {
  const role = req.user?.role;

  if (role === "admin" || role === "vendor") {
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

    if (product?.vendor_id !== user?.id) {
      throw new Error("ACCESS_DENIED_FOR_PRODUCT");
    }

    req.user = user;
    next();
  } else {
    req.user = user;
    next();
  }
};

module.exports = {
  isUserLoggedIn,
  isVendorOrAdmin,
  checkVendorProductOrNot,
};
