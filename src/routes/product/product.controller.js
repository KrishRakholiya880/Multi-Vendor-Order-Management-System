const productService = require("./product.service");

// getProducts
const getProducts = async (req, res, next) => {
  const { search, page, limit } = req.query;
  try {
    const result = await productService.getProducts(
      search,
      Number(page) || 1,
      Number(limit) || 30,
    );

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

// updateProduct
const updateProduct = async (req, res, next) => {
  const body = req.body;
  const { id } = req.params;

  let updateData = {};

  for (const el of Object.keys(body)) {
    if (body[el] !== undefined) {
      updateData[el] = body[el];
    }
  }

  try {
    const result = await productService.updateProduct(updateData, id);

    return res
      .status(200)
      .json({ status: true, message: "Product updated!!!" });
  } catch (error) {
    next(error);
  }
};

// changeProductStatusById
const changeProductStatusById = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await productService.changeProductStatusById(id, status);

    return res
      .status(200)
      .json({ status: true, message: "Product status changed!!!" });
  } catch (error) {
    next(error);
  }
};

// removeProductById
const removeProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await productService.removeProductById(id);

    return res.status(200).json({ status: true, message: "Product removed!!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  changeProductStatusById,
  removeProductById,
};
