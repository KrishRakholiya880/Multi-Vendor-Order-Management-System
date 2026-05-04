const orderService = require("./order.service");

// getOrder
const getOrder = async (req, res, next) => {
  const userData = req.user;
  try {
    const result = await orderService.getOrder(userData);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// addToOrder
const addToOrder = async (req, res, next) => {
  const userData = req.user;
  try {
    const result = await orderService.addToOrder(userData);

    return res
      .status(200)
      .json({ status: true, message: "Order added!!!", result });
  } catch (error) {
    next(error);
  }
};

// getVendorOrders
const getVendorOrders = async (req, res, next) => {
  const userData = req.user;
  try {
    const result = await orderService.getVendorOrders(userData);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// updateOrderStatusById
const updateOrderStatusById = async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const userData = req.user;
  try {
    const result = await orderService.updateOrderStatusById(id, data, userData);

    return res.status(200).json({ status: true, message: "Status Changed!!!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrder,
  addToOrder,
  getVendorOrders,
  updateOrderStatusById,
};
