const { sequelize } = require("../db/models");
const { decodeToken } = require("../helper/authHelper");
const authDb = require("../dbUtils/authDb");
const productDb = require("../dbUtils/productDb");
const refreshTokenDb = require("../dbUtils/refreshTokenDb");
const { logger } = require("../helper/logger");

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
  const t = await sequelize.transaction();
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      logger.warn("Unauthorized access attempt", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      throw new Error("TOKEN_REQUIRED");
    }

    const tokenData = await refreshTokenDb.findOne({ token: refreshToken }, t);
    if (!tokenData || new Date() > new Date(tokenData?.expires_at)) {
      throw new Error("SESSION_EXPIRED");
    }

    const decodedData = decodeToken(accessToken);

    if (!decodedData) {
      throw new Error("INVALID_ACCESS_TOKEN");
    }

    const userData = await authDb.findOne(
      { id: decodedData?.id },
      ["id", "full_name", "email", "phone_number", "status", "role"],
      t,
    );

    if (!userData) {
      throw new Error("USER_NOT_FOUND");
    }

    req.user = userData;
    await t.commit();
    next();
  } catch (error) {
    await t.rollback();
  }
};

const isAdmin = (req, res, next) => {
  const userData = req.user;

  if (userData?.role === "admin") {
    return next();
  }

  logger.error("Unauthorized access - admin only", {
    user_id: userData?.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  throw new Error("ONLY_ADMIN_ACCESS");
};

const isVendor = (req, res, next) => {
  const userData = req.user;

  if (userData?.role === "vendor") {
    return next();
  }

  logger.error("Unauthorized access - vendors only", {
    user_id: userData?.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  throw new Error("ONLY_VENDOR_ACCESS");
};

const isCustomer = (req, res, next) => {
  const userData = req.user;

  if (userData?.role === "customer") {
    return next();
  }

  logger.error("Unauthorized access - customer only", {
    user_id: userData?.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  throw new Error("ONLY_CUSTOMERS_ACCESS");
};

const isVendorOrAdmin = async (req, res, next) => {
  const userData = req.user;

  if (userData?.role === "admin" || userData?.role === "vendor") {
    return next();
  }

  logger.error("Unauthorized access - vendor or admin only", {
    user_id: userData?.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  throw new Error("ACCESS_DENIED");
};

const isAdminOrCustomer = async (req, res, next) => {
  const userData = req.user;

  if (userData?.role === "customer" || userData?.role === "admin") {
    return next();
  }

  logger.error("Unauthorized access - customer or admin only", {
    user_id: userData?.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  throw new Error("ACCESS_DENIED");
};

const checkVendorProductOrNot = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user;

    if (userData?.role === "vendor") {
      const { id } = req.params;

      const product = await productDb.findOne(
        { id: id },
        ["id", "name"],
        [],
        t,
      );

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (product?.vendor_id !== userData?.id) {
        logger.error(
          "Unauthorized access - vendor trying to access another vendor's product",
          {
            user_id: userData?.id,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
          },
        );
        throw new Error("ACCESS_DENIED_FOR_PRODUCT");
      }

      await t.commit();
      next();
    } else {
      next();
    }
  } catch (error) {
    await t.rollback();
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
