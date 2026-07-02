const { v4: uuidv4 } = require("uuid");
const { sequelize } = require("../db/models");
const { decodeToken } = require("../helper/authHelper");
const authDb = require("../dbUtils/authDb");
const productDb = require("../dbUtils/productDb");
const { logger } = require("../helper/logger");

const authenticate = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    req.requestId = uuidv4();

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
      logger.warn("Unauthorized access attempt:", {
        requestId: req.requestId,
        url: req.originalUrl,
        method: req.method,
      });
      throw new Error("TOKEN_REQUIRED");
    }

    const decodedData = decodeToken(accessToken);
    if (!decodedData) throw new Error("INVALID_ACCESS_TOKEN");

    const userData = await authDb.findOne(
      { id: decodedData?.id },
      ["id", "full_name", "email", "phone_number", "status", "role"],
      t,
    );

    if (!userData) throw new Error("USER_NOT_FOUND");
    if (userData?.status === "inactive") throw new Error("ACCOUNT_DEACTIVATED");

    req.user = userData;
    await t.commit();
    next();
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    req.requestId = uuidv4();

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

    const userData = await authDb.findOne(
      { id: decodedData?.id },
      {
        exclude: ["created_at", "updated_at", "deleted_at", "hashed_password"],
      },
      t,
    );

    req.user = userData;
    await t.commit();
    next();
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const authorizeRole = (...roles) => {
  return [
    authenticate,
    (req, res, next) => {
      if (roles.includes(req.user?.role)) return next();

      logger.error(`Unauthorized access - ${roles.join(" or ")} only`, {
        requestId: req.requestId,
        user_id: req.user?.id,
        url: req.originalUrl,
        method: req.method,
      });
      next(new Error("ACCESS_DENIED"));
    },
  ];
};

const checkVendorProductOrNot = async (req, res, next) => {
  const userData = req.user;

  if (userData?.role !== "vendor") {
    return next();
  }

  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const product = await productDb.findOne({ id }, ["id", "vendor_id"], [], t);

    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    if (product?.vendor_id !== userData?.id) {
      logger.error(
        "Unauthorized access - vendor trying to access another vendor's product",
        {
          requestId: req.requestId,
          user_id: userData?.id,
          url: req.originalUrl,
          method: req.method,
        },
      );
      throw new Error("ACCESS_DENIED_FOR_PRODUCT");
    }

    await t.commit();
    next();
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  optionalAuth,
  authenticate,
  authorizeRole,
  checkVendorProductOrNot,
};
