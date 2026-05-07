const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const categoryDb = require("../../dbUtils/categoryDb");

// getCategories
const getCategories = async () => {
  const t = await sequelize.transaction();

  try {
    const result = await categoryDb.findAll({}, t);

    if (!result) {
      throw new Error("CATEGORIES_NOT_FOUND");
    }

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// getCategoryById
const getCategoryById = async (id) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      id: {
        [Op.eq]: `${id}`,
      },
    };
    const result = await categoryDb.findOne(query, ["id", "name"], t);

    if (!result) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// createCategory
const createCategory = async (data) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      name: {
        [Op.eq]: `${data?.name}`,
      },
    };

    const isCategoryExists = await categoryDb.findOne(query, {}, t);

    if (isCategoryExists) {
      throw new Error("CATEGORY_EXISTS");
    }

    const result = await categoryDb.create(data, t);

    if (!result) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// updateProductById
const updateProductById = async (data, id) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      id: {
        [Op.eq]: `${id}`,
      },
    };

    const category = await categoryDb.findOne(query, {}, t);

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const result = await categoryDb.update(data, query, t);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// removeProductById
const removeProductById = async (id) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      id: {
        [Op.eq]: `${id}`,
      },
    };

    const category = await categoryDb.findOne(query, {}, t);

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const result = await categoryDb.remove(query, t);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateProductById,
  removeProductById,
};
