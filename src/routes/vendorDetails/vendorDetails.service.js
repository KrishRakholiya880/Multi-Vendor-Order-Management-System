const { Op } = require("sequelize");
const vendorDetailsDb = require("../../dbUtils/vendorDetailsDb");
const userDb = require("../../dbUtils/userDb");

// getVendorDetailsById
const getVendorDetailsById = async (id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };
  const vendorDetails = await vendorDetailsDb.findOne(query);

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
const createVendorDetails = async (data) => {
  const { user_id } = data;
  let query;
  let newData;

  query = {
    id: {
      [Op.eq]: `${user_id}`,
    },
  };

  const userData = await userDb.findOne(query);

  query = {
    user_id: {
      [Op.eq]: `${user_id}`,
    },
  };

  const isDetailsExists = await vendorDetailsDb.findOne(query);

  if (
    isDetailsExists?.company_name &&
    isDetailsExists?.company_email &&
    isDetailsExists?.company_phone_number &&
    isDetailsExists?.company_address &&
    isDetailsExists?.company_city
  ) {
    throw new Error("USER_DETAILS_ALREADY_FILLED");
  }

  newData = {
    user_id,
    vendor_status: userData?.status,
    ...data,
  };

  const result = await vendorDetailsDb.create(newData);

  return result;
};

module.exports = {
  getVendorDetailsById,
  getAllVendorDetails,
  createVendorDetails,
};
