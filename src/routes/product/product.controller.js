const productService = require("./product.service");

// getProducts
const getProducts = async (req, res, next) => {
  const { search, page, limit } = req.query;
  const userdata = req.user;

  try {
    const result = await productService.getProducts(
      userdata,
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
  const userData = req.user;
  const { id } = req.params;
  try {
    const result = await productService.getProductById(userData, id);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// createProduct
const createProduct = async (req, res, next) => {
  const body = req.body;
  const userData = req.user;

  try {
    const result = await productService.createProduct(userData, body);

    return res
      .status(201)
      .json({ status: true, message: "Product created!!!", result });
  } catch (error) {
    next(error);
  }
};

// updateProductById
const updateProductById = async (req, res, next) => {
  const body = req.body;
  const { id } = req.params;

  let updateData = {};

  for (const el of Object.keys(body)) {
    if (body[el] !== undefined) {
      updateData[el] = body[el];
    }
  }

  try {
    const result = await productService.updateProductById(updateData, id);

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
  updateProductById,
  changeProductStatusById,
  removeProductById,
};
