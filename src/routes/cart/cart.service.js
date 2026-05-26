const productDb = require("../../dbUtils/productDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { sequelize } = require("../../db/models");
const { product, cart_item, user } = require("../../db/models");
const { Op } = require("sequelize");
const { logger } = require("../../helper/logger");
const redisClient = require("../../helper/redis");

const cartItemsInclude = (withVendor = false) => [
  {
    model: cart_item,
    as: "cart_items",
    attributes: [
      "id",
      "cart_id",
      "quantity",
      "unit_price",
      ...(withVendor ? ["product_id"] : []),
    ],
    include: [
      {
        model: product,
        as: "product_info",
        attributes: [
          "id",
          "name",
          "description",
          "status",
          "price",
          ...(withVendor ? ["vendor_id"] : []),
        ],
        ...(withVendor && { include: { model: user, as: "vendor" } }),
      },
    ],
  },
];

const cartAttributes = ["id", "customer_id", "total_amount"];

const recalculateTotalAmount = async (cart_id, t) => {
  const allCartItems = await cartItemDb.findAll(
    { cart_id: { [Op.eq]: cart_id } },
    [],
    t,
  );

  const rawTotal = allCartItems.reduce((acc, item) => {
    const qty = parseInt(item.quantity);
    const price = parseFloat(item.unit_price);
    return acc + qty * price;
  }, 0);

  return parseFloat(rawTotal.toFixed(2));
};

// getCart
const getCart = async (userData, page, limit) => {
  const t = await sequelize.transaction();
  let result;

  try {
    const versionKey = `cart:version`;
    const version = await redisClient.GET_VERSION(versionKey);
    let cacheKey = `cart:${userData?.role || "guest"}:${version}`;

    if (page) cacheKey += `:page:${page}`;
    if (limit) cacheKey += `:limit:${limit}`;

    const cachedData = await redisClient.GET(cacheKey);
    if (cachedData) {
      await t.commit();
      return cachedData;
    }

    if (userData?.role === "admin") {
      result = await cartDb.findAll(
        {},
        page,
        limit,
        cartAttributes,
        cartItemsInclude(true),
        t,
      );

      if (!result || result.length === 0) throw new Error("CART_NOT_FOUND");
    } else {
      const customerCartData = await cartDb.findOne(
        {
          customer_id: { [Op.eq]: `${userData?.id}` },
        },
        {},
        [],
        t,
      );

      if (!customerCartData) throw new Error("CART_NOT_FOUND");

      result = await cartDb.findOne(
        { id: { [Op.eq]: `${customerCartData?.id}` } },
        cartAttributes,
        cartItemsInclude(),
        t,
      );

      if (!result) throw new Error("CART_NOT_FOUND");
    }

    await redisClient.SET(cacheKey, result, 2 * 60);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// addToCart
const addToCart = async (data, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const productData = await productDb.findOne(
      { id: { [Op.eq]: `${data?.product_id}` } },
      {},
      [],
      t,
    );

    if (!productData) throw new Error("PRODUCT_NOT_FOUND");
    if (productData?.status === "inactive")
      throw new Error("PRODUCT_UNAVAILABLE");
    if (productData?.stock === 0) throw new Error("OUT_OF_STOCK");
    if (productData?.stock < data?.quantity)
      throw new Error("INSUFFICIENT_STOCK");

    const existingCart = await cartDb.findOne(
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      {},
      [],
      t,
    );

    if (!existingCart) {
      const totalAmount = data?.quantity * productData?.price;

      const newCart = await cartDb.create(
        {
          customer_id: userData?.id,
          total_amount: totalAmount,
        },
        t,
      );

      await cartItemDb.create(
        {
          cart_id: newCart?.id,
          product_id: data?.product_id,
          quantity: data?.quantity,
          unit_price: productData?.price,
        },
        t,
      );

      await t.commit();
      logger.info("Product added to cart successfully", {
        method: reqUrlMet.method,
        url: reqUrlMet.url,
        user_id: userData?.id,
        product_id: data?.product_id,
        quantity: data?.quantity,
      });
      return newCart;
    }

    const existingCartItem = await cartItemDb.findOne(
      {
        cart_id: `${existingCart?.id}`,
        product_id: `${data?.product_id}`,
      },
      [],
      t,
    );

    if (existingCartItem) {
      const newQuantity = parseInt(existingCartItem?.quantity) + data?.quantity;

      await cartItemDb.update(
        { quantity: `${newQuantity}` },
        { id: `${existingCartItem?.id}` },
        t,
      );
    } else {
      await cartItemDb.create(
        {
          cart_id: `${existingCart?.id}`,
          product_id: `${data?.product_id}`,
          quantity: `${data?.quantity}`,
          unit_price: `${productData?.price}`,
        },
        t,
      );
    }

    const newTotalAmount = await recalculateTotalAmount(existingCart?.id, t);
    await cartDb.update(
      { total_amount: newTotalAmount },
      { id: { [Op.eq]: `${existingCart?.id}` } },
      t,
    );

    logger.info("Product added to cart successfully", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      product_id: data?.product_id,
      quantity: data?.quantity,
    });

    const latestCartData = await cartDb.findOne(
      { id: `${existingCart?.id}` },
      ["id", "customer_id", "total_amount"],
      [],
      t,
    );

    await redisClient.INCREMENT_VERSION(`cart:version`);

    await t.commit();
    return latestCartData;
  } catch (error) {
    await t.rollback();
    logger.error("Add to cart error", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// updateProductQuantityById
const updateProductQuantityById = async (
  product_id,
  body,
  userData,
  reqUrlMet,
) => {
  const t = await sequelize.transaction();
  try {
    const customerCartData = await cartDb.findOne(
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      {},
      [],
      t,
    );
    if (!customerCartData) throw new Error("CART_NOT_FOUND");

    const cartProduct = await cartItemDb.findOne(
      {
        cart_id: { [Op.eq]: `${customerCartData?.id}` },
        product_id: { [Op.eq]: `${product_id}` },
      },
      [],
      t,
    );
    if (!cartProduct) throw new Error("CART_PRODUCT_NOT_FOUND");

    const result = await cartItemDb.update(
      { quantity: body?.quantity },
      {
        cart_id: { [Op.eq]: `${customerCartData?.id}` },
        product_id: { [Op.eq]: `${product_id}` },
      },
      t,
    );

    const newTotalAmount = await recalculateTotalAmount(
      customerCartData?.id,
      t,
    );
    await cartDb.update(
      { total_amount: Number(newTotalAmount) },
      { id: { [Op.eq]: `${customerCartData?.id}` } },
      t,
    );

    await t.commit();

    logger.info("Cart item quantity updated successfully", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      product_id,
      new_quantity: body?.quantity,
    });

    await redisClient.INCREMENT_VERSION(`cart:version`);

    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Update cart quantity error", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// clearCart
const clearCart = async (userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const existingCustomerCart = await cartDb.findOne(
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      {},
      [],
      t,
    );
    if (!existingCustomerCart) throw new Error("CART_NOT_FOUND");

    await cartItemDb.remove(
      { cart_id: { [Op.eq]: `${existingCustomerCart?.id}` } },
      t,
    );

    const result = await cartDb.remove(
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      t,
    );

    logger.info("Cart cleared successfully", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
    });

    await redisClient.INCREMENT_VERSION(`cart:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Clear cart error", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// removeCartProductById
const removeCartProductById = async (product_id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const existingCustomerCart = await cartDb.findOne(
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      {},
      [],
      t,
    );
    if (!existingCustomerCart) throw new Error("CART_NOT_FOUND");

    const cartItemData = await cartItemDb.findOne(
      {
        cart_id: { [Op.eq]: `${existingCustomerCart?.id}` },
        product_id: { [Op.eq]: `${product_id}` },
      },
      [],
      t,
    );
    if (!cartItemData) throw new Error("PRODUCT_NOT_FOUND");

    const result = await cartItemDb.remove(
      {
        cart_id: { [Op.eq]: `${existingCustomerCart?.id}` },
        product_id: { [Op.eq]: `${product_id}` },
      },
      t,
    );

    const newTotalAmount = await recalculateTotalAmount(
      existingCustomerCart?.id,
      t,
    );
    await cartDb.update(
      { total_amount: Number(newTotalAmount) },
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      t,
    );

    logger.info("Product removed from cart successfully", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      product_id,
    });

    await redisClient.INCREMENT_VERSION(`cart:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Remove cart product error", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  getCart,
  addToCart,
  updateProductQuantityById,
  clearCart,
  removeCartProductById,
};
