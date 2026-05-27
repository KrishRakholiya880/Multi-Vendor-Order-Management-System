const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const vendorDetailsDb = require("../../dbUtils/vendorDetailsDb");
const userDb = require("../../dbUtils/userDb");
const redisClient = require("../../helper/redis");
const { user } = require("../../db/models");
const { logger } = require("../../helper/logger");

// getVendorDetailsById
const getVendorDetailsById = async (id) => {
  const t = await sequelize.transaction();
  try {
    const vendorDetails = await vendorDetailsDb.findOne(
      {
        id: { [Op.eq]: `${id}` },
      },
      {},
      // { exclude: ["created_at", "updated_at", "deleted_at"] },
      [{ model: user, as: "user_data" }],
      t,
    );

    if (!vendorDetails) throw new Error("VENDOR_DETAILS_NOT_FOUND");

    await t.commit();
    return vendorDetails;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// getAllVendorDetails
const getAllVendorDetails = async (
  search,
  status,
  sortBy = "desc",
  page,
  limit,
) => {
  const t = await sequelize.transaction();
  let query = {};

  try {
    const versionKey = `vendorDetails:version`;
    const version = await redisClient.GET_VERSION(versionKey);
    let cacheKey = `vendorDetails:${version}`;

    if (status) cacheKey += `:status:${status}`;
    if (page) cacheKey += `:page:${page}`;
    if (limit) cacheKey += `:limit:${limit}`;

    const cachedData = await redisClient.GET(cacheKey);
    if (cachedData) {
      await t.commit();
      return cachedData;
    }

    if (search) query.company_name = { [Op.like]: `%${search}%` };
    if (status) query.vendor_status = { [Op.like]: `${status}` };

    const result = await vendorDetailsDb.findAll(query, sortBy, page, limit, t);
    if (!result) throw new Error("VENDOR_DETAILS_NOT_FOUND");

    await redisClient.SET(cacheKey, result, 5 * 60);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// createVendorDetails
const createVendorDetails = async (data, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    let newData;

    if (userData?.role === "vendor") {
      const isDetailsExists = await vendorDetailsDb.findOne(
        {
          user_id: { [Op.eq]: `${userData?.id}` },
        },
        ["id"],
        [],
        t,
      );
      if (isDetailsExists?.id) throw new Error("USER_DETAILS_ALREADY_FILLED");

      newData = {
        ...data,
        user_id: userData?.id,
        vendor_status: userData?.status,
      };
    } else {
      if (userData?.role === "admin" && !data?.user_id)
        throw new Error("USER_ID_IS_REQUIRED");

      const userDetails = await userDb.findOne(
        {
          id: { [Op.eq]: `${data?.user_id}` },
        },
        ["id"],
        [],
        t,
      );

      const isDetailsExists = await vendorDetailsDb.findOne(
        {
          user_id: { [Op.eq]: `${userDetails?.id}` },
        },
        ["id"],
        [],
        t,
      );
      if (isDetailsExists?.id) throw new Error("USER_DETAILS_ALREADY_FILLED");

      newData = {
        ...data,
        user_id: data?.user_id,
        vendor_status: userDetails?.status,
      };
    }

    const result = await vendorDetailsDb.create(newData, t);
    if (!result) throw new Error("VENDOR_DETAILS_NOT_FOUND");

    logger.info("Vendor details created successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      user_id: newData?.user_id,
      created_by: userData?.id,
    });

    await redisClient.INCREMENT_VERSION(`vendorDetails:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Create vendor details error", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// updateVendorDetailsById
const updateVendorDetailsById = async (data, id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();

  try {
    const isVendorDetailsExists = await vendorDetailsDb.findOne(
      {
        id: { [Op.eq]: `${id}` },
      },
      ["user_id"],
      [],
      t,
    );
    if (isVendorDetailsExists) throw new Error("VENDOR_DETAILS_NOT_FOUND");

    if (
      userData?.role === "vendor" &&
      isVendorDetailsExists?.user_id !== userData?.id
    ) {
      throw new Error("UNAUTHORIZED_VENDOR_ACTION");
    }

    const result = await vendorDetailsDb.update(
      data,
      {
        id: { [Op.eq]: `${id}` },
      },
      t,
    );

    logger.info("Vendor details updated successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      user_id: isVendorDetailsExists?.user_id,
      created_by: userData?.id,
    });

    await redisClient.INCREMENT_VERSION(`vendorDetails:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Update vendor details error", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// removeVendorDetailsById
const removeVendorDetailsById = async (id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const isVendorDetailsExists = await vendorDetailsDb.findOne(
      {
        id: { [Op.eq]: `${id}` },
      },
      ["user_id"],
      [],
      t,
    );
    if (!isVendorDetailsExists) throw new Error("VENDOR_DETAILS_NOT_FOUND");

    if (
      userData?.role === "vendor" &&
      isVendorDetailsExists?.user_id !== userData?.id
    ) {
      throw new Error("UNAUTHORIZED_VENDOR_ACTION");
    }

    const result = await vendorDetailsDb.remove(
      { id: { [Op.eq]: `${id}` } },
      t,
    );

    logger.info("Vendor details removed successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      user_id: isVendorDetailsExists?.user_id,
      created_by: userData?.id,
    });

    await redisClient.INCREMENT_VERSION(`vendorDetails:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Remove vendor details error", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  getVendorDetailsById,
  getAllVendorDetails,
  createVendorDetails,
  updateVendorDetailsById,
  removeVendorDetailsById,
};
