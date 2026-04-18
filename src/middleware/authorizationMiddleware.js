const { decodeToken } = require("../helper/authHelper");
const authDb = require("../dbUtils/authDb");

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

module.exports = {
  isUserLoggedIn,
  isVendorOrAdmin,
};
