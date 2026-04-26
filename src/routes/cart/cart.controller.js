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

// addToCart
const addToCart = async (req, res, next) => {
  const userData = req.user;
  const body = req.body;

  try {
    const result = await cartService.addToCart({ body, userData });

    return res.status(201).json({
      status: true,
      message: "Product successfully added to cart!!!",
      result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
};
