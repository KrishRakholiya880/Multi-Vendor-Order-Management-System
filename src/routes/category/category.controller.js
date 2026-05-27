const categoryService = require("./category.service");

// getCategories
const getCategories = async (req, res, next) => {
  const { url, method } = req;
  const userData = req.user;

  try {
    const result = await categoryService.getCategories(userData, {
      url,
      method,
    });

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// getCategoryById
const getCategoryById = async (req, res, next) => {
  const { id } = req.params;
  const userData = req.user;

  try {
    const result = await categoryService.getCategoryById(userData, id);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// createCategory
const createCategory = async (req, res, next) => {
  const body = req.body;
  const { url, method } = req;

  try {
    const result = await categoryService.createCategory(body, { url, method });

    return res
      .status(201)
      .json({ status: true, message: "Category created!!!", result });
  } catch (error) {
    next(error);
  }
};

// updateCategoryById
const updateCategoryById = async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;
  const { url, method } = req;

  try {
    const result = await categoryService.updateCategoryById(body, id, {
      url,
      method,
    });

    return res
      .status(200)
      .json({ status: true, message: "Category updated!!!" });
  } catch (error) {
    next(error);
  }
};

// removeCategoryById
const removeCategoryById = async (req, res, next) => {
  const { id } = req.params;
  const { url, method } = req;

  try {
    const result = await categoryService.removeCategoryById(id, {
      url,
      method,
    });

    return res
      .status(200)
      .json({ status: true, message: "Category removed!!!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  removeCategoryById,
};
