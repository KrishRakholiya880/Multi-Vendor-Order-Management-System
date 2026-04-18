const productService = require("./product.service");

// getProducts
const getProducts = async (req, res, next) => {
  try {
    const { search, page, limit } = req.params;

    const result = await productService.getProducts(search, page, limit);

    return res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

// createProduct
const createProduct = async (req, res, next) => {
  const body = req.body;
  body.vendor_id = req.user.id;

  try {
    const result = await productService.createProduct(body);

    return res
      .status(201)
      .json({ status: true, message: "Product created!!!", result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  createProduct,
};
