const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const categoryDb = require("../../dbUtils/categoryDb");
const { logger } = require("../../helper/logger");

// getCategories
const getCategories = async (userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  let result;

  try {
    result = await categoryDb.findAll({}, {}, t);

    if (!result) {
      throw new Error("CATEGORIES_NOT_FOUND");
    }

    if (userData?.role === "customer" || userData?.role === "vendor") {
      result = result.map(({ created_at, updated_at, ...resData }) => resData);
    }

    logger.info("Categories found", {
      category_ids: result?.map((item) => item?.id),
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// getCategoryById
const getCategoryById = async (userData, id) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      id: {
        [Op.eq]: `${id}`,
      },
    };
    const result = await categoryDb.findOne(query, {}, t);

    if (!result) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    if (userData?.role === "customer" || userData?.role === "vendor") {
      delete result?.created_at;
      delete result?.updated_at;
    }

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// createCategory
const createCategory = async (data, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      name: {
        [Op.eq]: `${data?.name}`,
      },
    };

    const isCategoryExists = await categoryDb.findOne(query, ["id"], t);

    if (isCategoryExists) {
      throw new Error("CATEGORY_EXISTS");
    }

    const result = await categoryDb.create(data, t);

    if (!result) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    logger.info("Category created", {
      category_id: result?.id,
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Category create error:", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });
    throw error;
  }
};

// updateCategoryById
const updateCategoryById = async (data, id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      id: {
        [Op.eq]: `${id}`,
      },
    };

    const category = await categoryDb.findOne(query, ["id"], t);

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const result = await categoryDb.update(data, query, t);

    logger.info("Category updated:", {
      category_id: result?.id,
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Category update error:", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });
    throw error;
  }
};

// removeCategoryById
const removeCategoryById = async (id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const query = {
      id: {
        [Op.eq]: `${id}`,
      },
    };

    const category = await categoryDb.findOne(query, ["id"], t);

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const result = await categoryDb.remove(query, t);

    logger.info("Category removed:", {
      category_id: result?.id,
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Category remove error:", {
      user_id: userData?.id,
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
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
