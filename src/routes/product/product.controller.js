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

module.exports = {
  getProducts,
};
