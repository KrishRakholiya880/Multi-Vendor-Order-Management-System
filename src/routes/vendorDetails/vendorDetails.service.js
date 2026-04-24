const { Op } = require("sequelize");
const vendorDetailsDb = require("../../dbUtils/vendorDetailsDb");
const userDb = require("../../dbUtils/userDb");

// getVendorDetailsById
const getVendorDetailsById = async (paramsId, userData) => {
  let query = {};
  let vendorDetails;

  if (userData?.role === "vendor") {
    query = {
      user_id: {
        [Op.eq]: `${userData.id}`,
      },
    };
    vendorDetails = await vendorDetailsDb.findOne(query);
  }

  if (userData?.role === "admin") {
    query = {
      user_id: {
        [Op.eq]: `${paramsId}`,
      },
    };
    vendorDetails = await vendorDetailsDb.findOne(query);
  }

  if (!vendorDetails) {
    throw new Error("VENDOR_DETAILS_NOT_FOUND");
  }

  return vendorDetails;
};

// getAllVendorDetails
const getAllVendorDetails = async () => {
  const vendorDetails = await vendorDetailsDb.findAll();

  if (!vendorDetails) {
    throw new Error("VENDOR_DETAILS_NOT_FOUND");
  }

  return vendorDetails;
};

// createVendorDetails
const createVendorDetails = async (data, paramsId) => {
  let query = {};
  let userDetails;
  let newData;
  let result;

  if (data.userData?.role === "vendor") {
    query = {
      user_id: {
        [Op.eq]: `${user_id}`,
      },
    };

    const isDetailsExists = await vendorDetailsDb.findOne(query);

    if (isDetailsExists?.id) {
      throw new Error("USER_DETAILS_ALREADY_FILLED");
    }

    newData = {
      user_id,
      vendor_status: data.userData?.status,
      ...data,
    };

    result = await vendorDetailsDb.create(newData);
  } else {
    query = {
      id: {
        [Op.eq]: `${paramsId}`,
      },
    };

    userDetails = await userDb.findOne(query);

    if (userDetails?.role === "customer") {
      throw new Error("USER_IS_CUSTOMER");
    }

    query = {
      user_id: {
        [Op.eq]: `${userDetails?.id}`,
      },
    };

    const isDetailsExists = await vendorDetailsDb.findOne(query);

    if (isDetailsExists?.id) {
      throw new Error("USER_DETAILS_ALREADY_FILLED");
    }

    newData = {
      ...data,
      user_id: paramsId,
      vendor_status: userDetails?.status,
    };

    result = await vendorDetailsDb.create(newData);
  }

  if (!result) {
    throw new Error("VENDOR_DETAIL_CREATE_FAILED");
  }

  return result;
};

// updateVendorDetailsById
const updateVendorDetailsById = async (data, id) => {
  let query = {};
  query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const isVendorDetailsExists = await vendorDetailsDb.findOne(query);

  if (!isVendorDetailsExists) {
    throw new Error("VENDOR_DETAILS_NOT_FOUND");
  }

  const result = await vendorDetailsDb.update(data, query);

  if (result === 0) {
    throw new Error("VENDOR_DETAIL_UPDATE_FAILED");
  }

  return result;
};

// removeVendorDetailsById
const removeVendorDetailsById = async (id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const isVendorDetailsExists = await vendorDetailsDb.findOne(query);

  if (!isVendorDetailsExists) {
    throw new Error("VENDOR_DETAILS_NOT_FOUND");
  }

  const result = await vendorDetailsDb.remove(query);

  if (result === 0) {
    throw new Error("VENDOR_DETAIL_DELETE_FAILED");
  }

  return result;
};

module.exports = {
  getVendorDetailsById,
  getAllVendorDetails,
  createVendorDetails,
  updateVendorDetailsById,
  removeVendorDetailsById,
};
