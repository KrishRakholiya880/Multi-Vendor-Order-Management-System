const vendorDetailsService = require("./vendorDetails.service");

// getVendorDetailsById
const getVendorDetailsById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await vendorDetailsService.getVendorDetailsById(id);

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

module.exports = {
  getVendorDetailsById,
  getAllVendorDetails,
  createVendorDetails,
};
