const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const categoryDb = require("../../dbUtils/categoryDb");
const { logger } = require("../../helper/logger");

// getCategories
const getCategories = async (reqUrlMet) => {
  const t = await sequelize.transaction();

  try {
    const result = await categoryDb.findAll({}, t);

    if (!result) {
      throw new Error("CATEGORIES_NOT_FOUND");
    }

    logger.info("Categories found", {
      category_ids: result?.map((item) => item?.id),
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });

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
const createCategory = async (data, reqUrlMet) => {
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

    logger.info("Category created", {
      category_id: result?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Category create error", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });
    throw error;
  }
};

// updateCategoryById
const updateCategoryById = async (data, id, reqUrlMet) => {
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

    logger.error("Category updated", {
      category_id: result?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Category update", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });
    throw error;
  }
};

// removeCategoryById
const removeCategoryById = async (id, reqUrlMet) => {
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

    logger.error("Category removed", {
      category_id: result?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Category remove error", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
    });
    throw error;
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  removeCategoryById,
};
