const { decodeToken } = require("../../helper/authHelper");
const vendorDetailsService = require("./vendorDetails.service");

// getVendorDetailsById
const getVendorDetailsById = async (req, res, next) => {
  const { id } = req.params;
  const accessToken = req.cookies.accessToken;
  const decodedToken = decodeToken(accessToken);

  try {
    const result = await vendorDetailsService.getVendorDetailsById(
      id,
      decodedToken,
    );

    return res.status(201).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// getAllVendorDetails
const getAllVendorDetails = async (req, res, next) => {
  try {
    const result = await vendorDetailsService.getAllVendorDetails();

    return res.status(201).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// createVendorDetails
const createVendorDetails = async (req, res, next) => {
  const userData = req?.user;
  const body = { ...req.body, user_id: userData?.id };
  try {
    const result = await vendorDetailsService.createVendorDetails(body);

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
    );

    return res
      .status(201)
      .json({ status: true, message: "vendor details updated!!!" });
  } catch (error) {
    next(error);
  }
};

// removeVendorDetailsById
const removeVendorDetailsById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await vendorDetailsService.removeVendorDetailsById(id);

    return res
      .status(201)
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
