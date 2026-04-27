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

module.exports = {
  getOrder,
};
