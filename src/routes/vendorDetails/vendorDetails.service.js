const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const vendorDetailsDb = require("../../dbUtils/vendorDetailsDb");
const userDb = require("../../dbUtils/userDb");

// getVendorDetailsById
const getVendorDetailsById = async (paramsId) => {
  const t = await sequelize.transaction();
  try {
    const vendorDetails = await vendorDetailsDb.findOne(
      {
        user_id: { [Op.eq]: `${paramsId}` },
      },
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
const getAllVendorDetails = async () => {
  const t = await sequelize.transaction();
  try {
    const vendorDetails = await vendorDetailsDb.findAll({}, t);
    if (!vendorDetails) throw new Error("VENDOR_DETAILS_NOT_FOUND");

    await t.commit();
    return vendorDetails;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// createVendorDetails
const createVendorDetails = async (data, userData, paramsId, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    let newData;

    if (userData?.role === "vendor") {
      const isDetailsExists = await vendorDetailsDb.findOne(
        {
          user_id: { [Op.eq]: `${userData?.id}` },
        },
        t,
      );
      if (isDetailsExists?.id) throw new Error("USER_DETAILS_ALREADY_FILLED");

      newData = {
        ...data,
        user_id: userData?.id,
        vendor_status: userData?.status,
      };
    } else {
      const userDetails = await userDb.findOne(
        {
          id: { [Op.eq]: `${paramsId}` },
        },
        [],
        t,
      );

      const isDetailsExists = await vendorDetailsDb.findOne(
        {
          user_id: { [Op.eq]: `${userDetails?.id}` },
        },
        t,
      );
      if (isDetailsExists?.id) throw new Error("USER_DETAILS_ALREADY_FILLED");

      newData = {
        ...data,
        user_id: paramsId,
        vendor_status: userDetails?.status,
      };
    }

    const result = await vendorDetailsDb.create(newData, t);

    logger.info("Vendor details created successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      user_id: newData?.user_id,
      created_by: userData?.id,
    });

    if (!result) throw new Error("VENDOR_DETAILS_NOT_FOUND");

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
      t,
    );
    if (!isVendorDetailsExists) throw new Error("VENDOR_DETAILS_NOT_FOUND");

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
      user_id: newData?.user_id,
      created_by: userData?.id,
    });

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
