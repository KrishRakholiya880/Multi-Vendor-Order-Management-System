const cartService = require("./cart.service");

// getCart
const getCart = async (req, res, next) => {
  const userData = req.user;
  const { page, limit } = req.query;

  try {
    const result = await cartService.getCart(
      userData,
      Number(page) || 1,
      Number(limit) || 10,
    );

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// addToCart
const addToCart = async (req, res, next) => {
  const userData = req.user;
  const body = req.body;
  const { url, method, requestId } = req;

  try {
    const result = await cartService.addToCart(body, userData, {
      url,
      method,
      requestId,
    });

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
  const { url, method, requestId } = req;

  try {
    const result = await cartService.updateProductQuantityById(
      product_id,
      body,
      userData,
      { url, method, requestId },
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
  const { url, method, requestId } = req;

  try {
    const result = await cartService.clearCart(userData, {
      url,
      method,
      requestId,
    });

    return res
      .status(200)
      .json({ status: true, message: "Cart cleared!!!", result });
  } catch (error) {
    next(error);
  }
};

const removeCartProductById = async (req, res, next) => {
  const { product_id } = req.params;
  const userData = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await cartService.removeCartProductById(
      product_id,
      userData,
      { url, method, requestId },
    );

    return res
      .status(200)
      .json({ status: true, message: "Product removed from cart!!!", result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateProductQuantityById,
  clearCart,
  removeCartProductById,
};
