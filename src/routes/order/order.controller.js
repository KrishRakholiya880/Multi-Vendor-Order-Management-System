const orderService = require("./order.service");

// getOrder
const getOrder = async (req, res, next) => {
  const userData = req.user;
  const { status, itemStatus } = req.query;

  try {
    const result = await orderService.getOrder(userData, status, itemStatus);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// addToOrder
const addToOrder = async (req, res, next) => {
  const userData = req.user;
  const { url, method } = req;

  try {
    const result = await orderService.addToOrder(userData, { url, method });

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
  const { itemStatus } = req.query;

  try {
    const result = await orderService.getVendorOrders(userData, itemStatus);

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
  const { url, method } = req;

  try {
    const result = await orderService.updateOrderStatusById(
      id,
      data,
      userData,
      { url, method },
    );

    return res.status(200).json({ status: true, message: "Status Changed!!!" });
  } catch (error) {
    next(error);
  }
};

// cancelOrderItemById
const cancelOrderItemById = async (req, res, next) => {
  const { item_id } = req.params;
  const userData = req.user;
  const { url, method } = req;

  try {
    const result = await orderService.cancelOrderItemById(item_id, userData, {
      url,
      method,
    });

    return res
      .status(200)
      .json({ status: true, message: "Order cancelled!!!", result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrder,
  addToOrder,
  getVendorOrders,
  updateOrderStatusById,
  cancelOrderItemById,
};
