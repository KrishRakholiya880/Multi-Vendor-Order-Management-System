const orderService = require("./order.service");

// getOrder
const getOrder = async (req, res, next) => {
  const userData = req.user;
  const { page, limit, status, itemStatus } = req.query;

  try {
    const result = await orderService.getOrder(
      userData,
      Number(page) || 1,
      Number(limit) || 30,
      status,
      itemStatus,
    );

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// addToOrder
const addToOrder = async (req, res, next) => {
  const userData = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await orderService.addToOrder(userData, {
      url,
      method,
      requestId,
    });

    return res.status(result?.statusCode || 200).json({
      status: result?.status ?? true,
      message: result?.message ?? "Order added!!!",
      result: result?.statusCode === 400 ? [] : result,
    });
  } catch (error) {
    next(error);
  }
};

// getVendorOrders
const getVendorOrders = async (req, res, next) => {
  const userData = req.user;
  const { page, limit, itemStatus } = req.query;

  try {
    const result = await orderService.getVendorOrders(
      userData,
      Number(page) || 1,
      Number(limit) || 30,
      itemStatus,
    );

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
  const { url, method, requestId } = req;

  try {
    const result = await orderService.updateOrderStatusById(
      id,
      data,
      userData,
      { url, method, requestId },
    );

    return res.status(200).json({ status: true, message: "Status Changed!!!" });
  } catch (error) {
    next(error);
  }
};

// cancelOrderItemById
const cancelOrderItemById = async (req, res, next) => {
  const { id } = req.params;
  const userData = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await orderService.cancelOrderItemById(id, userData, {
      url,
      method,
      requestId,
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
