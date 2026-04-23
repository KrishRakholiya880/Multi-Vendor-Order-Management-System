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

  if (!result) {
    throw new Error("VENDOR_DETAIL_CREATE_FAILED");
  }

  return result;
};

// updateVendorDetailsById
const updateVendorDetailsById = async (data, id) => {
  let query;
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
