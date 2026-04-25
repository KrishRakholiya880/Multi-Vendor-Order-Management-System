const cartService = require("./cart.service");

// getCart
const getCart = async (req, res, next) => {
  try {
    const result = await cartService.getCart();

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
};
