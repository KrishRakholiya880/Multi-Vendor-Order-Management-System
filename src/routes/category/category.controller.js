const categoryService = require("./category.service");

// getCategories
const getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getCategories();

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// getCategoryById
const getCategoryById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await categoryService.getCategoryById(id);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// createCategory
const createCategory = async (req, res, next) => {
  const body = req.body;
  try {
    const result = await categoryService.createCategory(body);

    return res
      .status(201)
      .json({ status: true, message: "Category created!!!", result });
  } catch (error) {
    next(error);
  }
};

// updateProductById
const updateProductById = async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;
  try {
    const result = await categoryService.updateProductById(body, id);

    return res
      .status(201)
      .json({ status: true, message: "Category updated!!!" });
  } catch (error) {
    next(error);
  }
};

// removeProductById
const removeProductById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await categoryService.removeProductById(id);

    return res
      .status(201)
      .json({ status: true, message: "Category removed!!!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateProductById,
  removeProductById,
};
