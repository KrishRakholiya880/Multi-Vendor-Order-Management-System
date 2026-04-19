const productService = require("./product.service");

// getProducts
const getProducts = async (req, res, next) => {
  const { search, page, limit } = req.params;
  try {
    const result = await productService.getProducts(search, page, limit);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// getProductById
const getProductById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await productService.getProductById(id);

    return res.status(200).json({ status: true, result });
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
  getProductById,
  createProduct,
};
