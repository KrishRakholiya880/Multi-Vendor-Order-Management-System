const vendorDetailsService = require("./vendorDetails.service");

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
  createVendorDetails,
};
