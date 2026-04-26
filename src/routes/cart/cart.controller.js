const cartService = require("./cart.service");

// getCart
const getCart = async (req, res, next) => {
  const userData = req.user;
  try {
    const result = await cartService.getCart(userData);

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

// updateProductQuantityById
const updateProductQuantityById = async (req, res, next) => {
  const { product_id } = req.params;
  const body = req.body;
  const userData = req.user;

  try {
    const result = await cartService.updateProductQuantityById(
      product_id,
      body,
      userData,
    );

    return res.status(200).json({
      status: true,
      message: "Quantity Updated!!!",
      result,
    });
  } catch (error) {
    next(error);
  }
};

// clearCart
const clearCart = async (req, res, next) => {
  const userData = req.user;
  try {
    const result = await cartService.clearCart(userData);

    return res
      .status(200)
      .json({ status: true, message: "Cart cleared!!!", result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateProductQuantityById,
  clearCart,
};
