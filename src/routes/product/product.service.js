const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const productDb = require("../../dbUtils/productDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { category, user, vendor_detail } = require("../../db/models");
const { logger } = require("../../helper/logger");
const redisClient = require("../../helper/redis");
const calculateTotalAmount = require("../../helper/calculateTotalAmount");

// generateSKU
const generateSKU = (name, category_id, vendor_id) => {
  const pNamePrefix = name.slice(0, 3).toUpperCase();
  const categoryCode = `C${String(category_id).padStart(2, "0")}`;
  const vendorCode = `V${String(vendor_id).padStart(3, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${pNamePrefix}-${categoryCode}-${vendorCode}-${random}`;
};

// changesToCartAfterUpdateOrRemoveProduct
const changesToCartAfterUpdateOrRemoveProduct = async (productId) => {
  const t = await sequelize.transaction();
  try {
    const cartItemsData = await cartItemDb.findAll(
      { product_id: Number(productId) },
      ["id", "cart_id", "product_id"],
      [],
      t,
    );

    if (cartItemsData && cartItemsData.length > 0) {
      for (const item of cartItemsData) {
        await cartItemDb.remove({ id: item?.id }, t);

        const remainingItems = await cartItemDb.findAll(
          { cart_id: item?.cart_id },
          ["quantity", "unit_price"],
          [],
          t,
        );

        if (!remainingItems || remainingItems.length === 0) {
          await cartDb.remove({ id: item?.cart_id }, t);
        } else {
          const newTotal = await calculateTotalAmount("cart", item?.cart_id, t);
          await cartDb.update(
            { total_amount: newTotal },
            { id: { [Op.eq]: item?.cart_id } },
            t,
          );
        }
      }
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// getProducts
const getProducts = async (
  userData,
  status,
  search,
  sortBy,
  priceSort,
  categoryId,
  page,
  limit,
  reqUrlMet,
) => {
  const t = await sequelize.transaction();
  let query = {};
  let result;

  try {
    const versionKey = `products:version`;
    const version = await redisClient.GET_VERSION(versionKey);
    let cacheKey = `products:${userData?.role || "guest"}${userData ? `:${userData?.id}` : ""}:${version}`;

    if (status) cacheKey += `:status:${status}`;
    if (search) cacheKey += `:search:${search}`;
    if (sortBy) cacheKey += `:sortBy:${sortBy}`;
    if (priceSort) cacheKey += `:priceSort:${priceSort}`;
    if (categoryId) cacheKey += `:categoryId:${categoryId}`;
    if (page) cacheKey += `:page:${page}`;
    if (limit) cacheKey += `:limit:${limit}`;

    const cachedData = await redisClient.GET(cacheKey);
    if (cachedData) {
      logger.info("Cache hit - Products fetched from cache", {
        url: reqUrlMet.url,
        method: reqUrlMet.method,
        requestId: reqUrlMet.requestId,
        user_id: userData?.id,
        cache_key: cacheKey,
      });
      await t.commit();
      return cachedData;
    }

    logger.warn("Cache miss - Fetching products from DB", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      cache_key: cacheKey,
    });

    if (categoryId) query.category_id = { [Op.eq]: `${categoryId}` };
    if (search) {
      query[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const include = [
      { model: category, as: "category", attributes: ["id", "name"] },
    ];
    const attributes = [
      "id",
      "name",
      "description",
      "category_id",
      "vendor_id",
      "status",
      "stock",
      "price",
    ];

    if (!userData || userData?.role === "customer") {
      query = { ...query, status: { [Op.eq]: "active" } };
    } else if (userData?.role === "vendor") {
      query = {
        ...query,
        vendor_id: { [Op.eq]: `${userData?.id}` },
        ...(status && { status: { [Op.eq]: status } }),
      };
    } else if (userData?.role === "admin") {
      if (status) query.status = { [Op.eq]: status };

      include.push({
        model: user,
        as: "vendor",
        attributes: ["id", "full_name", "email"],
        include: [
          {
            model: vendor_detail,
            as: "vendor_detail",
            attributes: ["company_name", "company_email", "company_city"],
          },
        ],
      });
    }

    result = await productDb.findAll(
      query,
      attributes,
      include,
      sortBy,
      priceSort,
      page,
      limit,
      t,
    );

    if (!result || (Array.isArray(result) && result.length === 0)) {
      await t.commit();
      return [];
    }

    await redisClient.SET(cacheKey, result, 10 * 60);

    logger.info("Products fetched successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      total: result?.length,
      user_id: userData?.id,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Get products error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// getProductById
const getProductById = async (userData, id, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const versionKey = `products:version`;
    const version = await redisClient.GET_VERSION(versionKey);
    const cacheKey = `products:${userData?.role || "guest"}${userData?.role === "vendor" ? `:${userData?.id}` : ""}:${version}:id:${id}`;

    const cachedData = await redisClient.GET(cacheKey);
    if (cachedData) {
      logger.info("Cache hit - Products fetched from cache", {
        url: reqUrlMet.url,
        method: reqUrlMet.method,
        requestId: reqUrlMet.requestId,
        user_id: userData?.id,
        cache_key: cacheKey,
      });
      await t.commit();
      return cachedData;
    }

    logger.warn("Cache miss - Fetching products from DB", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      cache_key: cacheKey,
    });

    const query = { id: { [Op.eq]: `${id}` } };
    const attributes = [
      "id",
      "name",
      "description",
      "category_id",
      "vendor_id",
      "status",
      "price",
      "stock",
    ];
    const include = [
      { model: category, as: "category", attributes: ["id", "name"] },
    ];

    if (userData?.role === "admin") {
      include.push({
        model: user,
        as: "vendor",
        attributes: ["id", "full_name", "email"],
        include: [
          {
            model: vendor_detail,
            as: "vendor_detail",
            attributes: ["company_name", "company_email", "company_city"],
          },
        ],
      });
    }

    const result = await productDb.findOne(query, attributes, include, t);

    if (!result) throw new Error("PRODUCT_NOT_FOUND");

    if (userData?.role === "vendor" && result?.vendor_id !== userData?.id) {
      throw new Error("ACCESS_DENIED_FOR_PRODUCT");
    }

    if (
      (!userData || userData?.role === "customer") &&
      (result?.status === "inactive" || result?.status === "out_of_stock")
    ) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }

    await redisClient.SET(cacheKey, result, 5 * 60);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// createProduct
const createProduct = async (userData, data, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    if (userData?.role === "admin" && !data?.vendor_id) {
      throw new Error("VENDOR_ID_REQUIRED");
    }

    const vendor_id =
      userData?.role === "vendor" ? userData?.id : data?.vendor_id;
    const sku =
      data?.sku || generateSKU(data?.name, data?.category_id, vendor_id);

    const isProductExists = await productDb.findOne(
      {
        sku: { [Op.eq]: `${sku}` },
      },
      ["id", "name"],
      [],
      t,
    );

    if (isProductExists) throw new Error("PRODUCT_EXISTS");

    const newDataObj = { ...data, sku, vendor_id };
    const result = await productDb.create(newDataObj, t);

    logger.info("Product created successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      product_id: result?.id,
      user_id: vendor_id,
      created_by: userData?.id,
    });

    await redisClient.INCREMENT_VERSION(`products:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Create product error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// updateProductById
const updateProductById = async (data, id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const query = { id: { [Op.eq]: `${id}` } };

    const isProductExists = await productDb.findOne(
      query,
      ["id", "name"],
      [],
      t,
    );
    if (!isProductExists) throw new Error("PRODUCT_NOT_FOUND");

    const result = await productDb.update(data, query, t);

    logger.info("Product updated successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      product_id: id,
    });

    await redisClient.INCREMENT_VERSION(`products:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Update product error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      product_id: id,
      error: error.message,
    });
    throw error;
  }
};

// changeProductStatusById
const changeProductStatusById = async (id, status, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const query = { id: { [Op.eq]: `${id}` } };

    const isProductExists = await productDb.findOne(
      query,
      ["id", "name", "status"],
      [],
      t,
    );
    if (!isProductExists) throw new Error("PRODUCT_NOT_FOUND");

    if (isProductExists?.status === status) {
      throw new Error("PRODUCT_UPDATE_STATUS_FAILED");
    }

    const result = await productDb.update({ status }, query, t);

    if (result && status === "inactive") {
      await changesToCartAfterUpdateOrRemoveProduct(id);
    }

    logger.info("Product status changed successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      product_id: id,
      user_id: userData?.id,
      new_status: status,
    });

    await redisClient.INCREMENT_VERSION(`products:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Change product status error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      product_id: id,
      error: error.message,
    });
    throw error;
  }
};

// removeProductById
const removeProductById = async (id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const query = { id: { [Op.eq]: `${id}` } };

    const isProductExists = await productDb.findOne(
      query,
      ["id", "name"],
      [],
      t,
    );
    if (!isProductExists) throw new Error("PRODUCT_NOT_FOUND");

    const result = await productDb.remove(query, t);

    if (result) {
      await changesToCartAfterUpdateOrRemoveProduct(id);
    }

    logger.info("Product removed successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      product_id: id,
    });

    await redisClient.INCREMENT_VERSION(`products:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Remove product error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      user_id: userData?.id,
      product_id: id,
      error: error.message,
    });
    throw error;
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
