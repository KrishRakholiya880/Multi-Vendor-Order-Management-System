const vendorDetailsService = require("./vendorDetails.service");

// getVendorDetailsById
const getVendorDetailsById = async (req, res, next) => {
  const { id } = req.params;
  const userData = req.user;

  try {
    const result = await vendorDetailsService.getVendorDetailsById(
      id,
      userData,
    );

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// getAllVendorDetails
const getAllVendorDetails = async (req, res, next) => {
  const { search, status, sortBy, page, limit } = req.query;
  try {
    const result = await vendorDetailsService.getAllVendorDetails(
      search,
      status,
      sortBy,
      Number(page) || 1,
      Number(limit) || 30,
    );

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// createVendorDetails
const createVendorDetails = async (req, res, next) => {
  const body = req.body;
  const userData = req?.user;
  const { url, method, requestId } = req;

  try {
    const result = await vendorDetailsService.createVendorDetails(
      body,
      userData,
      { url, method, requestId },
    );

    return res
      .status(201)
      .json({ status: true, message: "vendor details added!!!", result });
  } catch (error) {
    next(error);
  }
};

// updateVendorDetailsById
const updateVendorDetailsById = async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;
  const userData = req.user;
  const { url, method, requestId } = req;

  let updateData = {};

  for (const el of Object.keys(body)) {
    if (body[el] !== undefined) {
      updateData[el] = body[el];
    }
  }

  try {
    const result = await vendorDetailsService.updateVendorDetailsById(
      updateData,
      id,
      userData,
      { url, method, requestId },
    );

    return res
      .status(200)
      .json({ status: true, message: "vendor details updated!!!" });
  } catch (error) {
    next(error);
  }
};

// removeVendorDetailsById
const removeVendorDetailsById = async (req, res, next) => {
  const { id } = req.params;
  const userData = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await vendorDetailsService.removeVendorDetailsById(
      id,
      userData,
      { url, method, requestId },
    );

    return res
      .status(200)
      .json({ status: true, message: "vendor details removed!!!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendorDetailsById,
  getAllVendorDetails,
  createVendorDetails,
  updateVendorDetailsById,
  removeVendorDetailsById,
};
