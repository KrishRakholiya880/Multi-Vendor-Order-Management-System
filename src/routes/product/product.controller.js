const productService = require("./product.service");

// getProducts
const getProducts = async (req, res, next) => {
  const { status, search, sortBy, priceSort, categoryId, page, limit } =
    req.query;
  const userdata = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await productService.getProducts(
      userdata,
      status,
      search,
      sortBy,
      priceSort,
      categoryId,
      Number(page) || 1,
      Number(limit) || 30,
      { url, method, requestId },
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
  const { url, method, requestId } = req;

  try {
    const result = await productService.getProductById(userData, id, {
      url,
      method,
      requestId,
    });

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// createProduct
const createProduct = async (req, res, next) => {
  const body = req.body;
  const userData = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await productService.createProduct(userData, body, {
      url,
      method,
      requestId,
    });

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
  const userData = req.user;
  const { url, method, requestId } = req;

  let updateData = {};

  for (const el of Object.keys(body)) {
    if (body[el] !== undefined) {
      updateData[el] = body[el];
    }
  }

  try {
    const result = await productService.updateProductById(
      updateData,
      id,
      userData,
      {
        url,
        method,
        requestId,
      },
    );

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
  const userData = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await productService.changeProductStatusById(
      id,
      status,
      userData,
      {
        url,
        method,
        requestId,
      },
    );

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
  const userData = req.user;
  const { url, method, requestId } = req;

  try {
    const result = await productService.removeProductById(id, userData, {
      url,
      method,
      requestId,
    });

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
