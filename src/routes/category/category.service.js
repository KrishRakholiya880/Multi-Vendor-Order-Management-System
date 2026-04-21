const { Op } = require("sequelize");
const categoryDb = require("../../dbUtils/categoryDb");

// getCategories
const getCategories = async () => {
  const result = await categoryDb.findAll();

  if (!result) {
    throw new Error("CATEGORIES_NOT_FOUND");
  }

  return result;
};

// getCategoryById
const getCategoryById = async (id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };
  const result = await categoryDb.findOne(query, ["id", "name"]);

  if (!result) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  return result;
};

// createCategory
const createCategory = async (data) => {
  const query = {
    name: {
      [Op.eq]: `${data?.name}`,
    },
  };

  const isCategoryExists = await categoryDb.findOne(query);

  if (isCategoryExists) {
    throw new Error("CATEGORY_EXISTS");
  }

  const result = await categoryDb.create(data);

  if (!result) {
    throw new Error("CATEGORY_CREATION_FAILED");
  }

  return result;
};

// updateProductById
const updateProductById = async (data, id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const category = await categoryDb.findOne(query);

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const result = await categoryDb.update(data, query);

  if (!result) {
    throw new Error("CATEGORY_UPDATE_FAILED");
  }

  return result;
};

// removeProductById
const removeProductById = async (id) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const category = await categoryDb.findOne(query);

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const result = await categoryDb.remove(query);

  if (!result) {
    throw new Error("CATEGORY_REMOVE_FAILED");
  }

  return result;
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateProductById,
  removeProductById,
};
