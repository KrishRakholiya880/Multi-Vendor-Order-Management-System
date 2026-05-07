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
const createVendorDetails = async (data, paramsId) => {
  const t = await sequelize.transaction();
  try {
    let newData;

    if (data.userData?.role === "vendor") {
      const isDetailsExists = await vendorDetailsDb.findOne(
        {
          user_id: { [Op.eq]: `${data.userData?.id}` },
        },
        t,
      );
      if (isDetailsExists?.id) throw new Error("USER_DETAILS_ALREADY_FILLED");

      newData = {
        user_id: data.userData?.id,
        vendor_status: data.userData?.status,
        ...data,
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
    if (!result) throw new Error("VENDOR_DETAILS_NOT_FOUND");

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// updateVendorDetailsById
const updateVendorDetailsById = async (data, id, userData) => {
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

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// removeVendorDetailsById
const removeVendorDetailsById = async (id, userData) => {
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

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
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
