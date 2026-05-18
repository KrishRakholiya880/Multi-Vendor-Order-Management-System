const { Op } = require("sequelize");
const productDb = require("../../dbUtils/productDb");
const orderDb = require("../../dbUtils/orderDb");
const orderItemDb = require("../../dbUtils/orderItemDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { sequelize } = require("../../db/models");
const { order_item, product } = require("../../db/models");
const { logger } = require("../../helper/logger");
const redisClient = require("../../helper/redis");

const isValidStatusTransition = (oldStatus, newStatus) => {
  const statusRank = {
    placed: 1,
    confirmed: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 5,
  };
  const oldRank = statusRank[oldStatus];
  const newRank = statusRank[newStatus];

  if (!oldRank || !newRank) return false;
  if (newStatus === "delivered") return oldStatus !== "cancelled";
  if (newStatus === "cancelled") return oldStatus !== "delivered";
  return newRank > oldRank;
};

const orderItemsInclude = (itemStatus = null) => [
  {
    model: order_item,
    as: "order_items",
    ...(itemStatus
      ? { where: { status: { [Op.eq]: itemStatus } }, required: false }
      : {}),
    attributes: [
      "id",
      "order_id",
      "product_id",
      "quantity",
      "price_at_purchase",
      "status",
      "placed_at",
      "shipped_at",
      "delivered_at",
      "cancelled_at",
    ],
    include: [
      {
        model: product,
        as: "product_info",
        attributes: ["id", "name", "description", "status", "price"],
      },
    ],
  },
];

const orderAttributes = [
  "id",
  "customer_id",
  "total_amount",
  "status",
  "created_at",
];

const recalculateOrderTotal = async (order_id, t) => {
  const allOrderItems = await orderItemDb.findAll(
    {
      order_id: { [Op.eq]: order_id },
      status: { [Op.ne]: "cancelled" },
    },
    {},
    [],
    t,
  );

  const rawTotal = allOrderItems.reduce((acc, item) => {
    const qty = parseInt(item.quantity);
    const price = parseFloat(item.price_at_purchase);
    return acc + qty * price;
  }, 0);

  return parseFloat(rawTotal.toFixed(2));
};

// getOrder
const getOrder = async (userData, page, limit, status, itemStatus) => {
  const t = await sequelize.transaction();
  try {
    const versionKey = `orders:version`;
    const version = await redisClient.GET_VERSION(versionKey);
    let cacheKey = `orders:${userData?.role}:${version}`;

    if (page) cacheKey += `:page:${page}`;
    if (limit) cacheKey += `:limit:${limit}`;
    if (status) cacheKey += `:status:${status}`;
    if (itemStatus) cacheKey += `:itemStatus:${itemStatus}`;

    let result;
    let query = {};

    const cachedData = await redisClient.GET(cacheKey);
    if (cachedData) {
      await t.commit();
      return cachedData;
    }

    if (userData?.role === "admin") {
      if (status) query.status = { [Op.eq]: status };

      result = await orderDb.findAll(
        query,
        page,
        limit,
        orderAttributes,
        orderItemsInclude(itemStatus),
        t,
      );
    } else {
      query.customer_id = { [Op.eq]: `${userData?.id}` };
      if (status) query.status = { [Op.eq]: status };

      result = await orderDb.findAll(
        query,
        page,
        limit,
        orderAttributes,
        orderItemsInclude(itemStatus),
        t,
      );
    }

    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("ORDERS_NOT_FOUND");
    }

    await redisClient.SET(cacheKey, result, 180);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// addToOrder
const addToOrder = async (userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  let result;

  try {
    const cartData = await cartDb.findOne(
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      {},
      [],
      t,
    );
    if (!cartData) throw new Error("CART_NOT_FOUND");

    const cartItems = await cartItemDb.findAll(
      { cart_id: { [Op.eq]: `${cartData?.id}` } },
      [],
      t,
    );
    if (!cartItems || cartItems.length === 0)
      throw new Error("CART_ITEMS_NOT_FOUND");

    result = await orderDb.create(
      {
        customer_id: userData?.id,
        total_amount: cartData?.total_amount || 0,
      },
      t,
    );

    for (const item of cartItems) {
      await orderItemDb.create(
        {
          order_id: result?.id,
          product_id: item?.product_id,
          quantity: item?.quantity,
          price_at_purchase: parseFloat(item?.unit_price).toFixed(2),
        },
        t,
      );

      const productData = await productDb.findOne(
        { id: { [Op.eq]: `${item?.product_id}` } },
        {},
        [],
        t,
      );
      if (!productData) throw new Error("PRODUCT_NOT_FOUND");

      await productDb.update(
        { stock: productData?.stock - item?.quantity },
        { id: { [Op.eq]: `${item?.product_id}` } },
        t,
      );
    }

    const newOrderTotal = await recalculateOrderTotal(result?.id, t);
    await orderDb.update(
      { total_amount: newOrderTotal },
      { id: { [Op.eq]: result?.id } },
      t,
    );

    await cartItemDb.remove({ cart_id: { [Op.eq]: `${cartData?.id}` } }, t);
    await cartDb.remove({ id: { [Op.eq]: `${cartData?.id}` } }, t);

    logger.info("Order placed successfully", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      order_id: result?.id,
      total_amount: newOrderTotal,
    });

    await redisClient.INCREMENT_VERSION(`orders:version`);
    await redisClient.INCREMENT_VERSION(`products:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Place order error", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      error: error.message,
    });
    throw error;
  }
};

// getVendorOrders
const getVendorOrders = async (userData, page, limit, itemStatus) => {
  const t = await sequelize.transaction();
  try {
    const versionKey = `orders:version`;
    const version = await redisClient.GET_VERSION(versionKey);
    let cacheKey = `orders:${userData?.role}:${version}`;

    if (page) cacheKey += `:page:${page}`;
    if (limit) cacheKey += `:limit:${limit}`;
    if (itemStatus) cacheKey += `:itemStatus:${itemStatus}`;

    const cachedData = await redisClient.GET(cacheKey);
    if (cachedData) {
      await t.commit();
      return cachedData;
    }

    const result = await orderDb.findAll(
      {},
      page,
      limit,
      ["id", "customer_id", "status", "created_at"],
      [
        {
          model: order_item,
          as: "order_items",
          required: true,
          ...(itemStatus ? { where: { status: { [Op.eq]: itemStatus } } } : {}),
          attributes: [
            "id",
            "product_id",
            "status",
            "quantity",
            "price_at_purchase",
            "placed_at",
            "shipped_at",
            "delivered_at",
            "cancelled_at",
          ],
          include: [
            {
              model: product,
              as: "product_info",
              required: true,
              ...(userData?.role === "vendor" && {
                where: { vendor_id: { [Op.eq]: `${userData?.id}` } },
              }),
              ...(userData?.role === "vendor" && {
                attributes: ["id", "name", "description", "price", "status"],
              }),
            },
          ],
        },
      ],
      t,
    );

    if (!result || result.length === 0)
      throw new Error("VENDOR_ORDERS_NOT_FOUND");

    await redisClient.SET(cacheKey, result, 120);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// updateOrderStatusById
const updateOrderStatusById = async (id, data, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const orderItemData = await orderItemDb.findOne({ id: `${id}` }, t);
    if (!orderItemData) throw new Error("ORDER_ITEM_NOT_FOUND");

    if (userData?.role === "vendor") {
      const productData = await productDb.findOne(
        {
          id: `${orderItemData?.product_id}`,
        },
        {},
        [],
        t,
      );
      if (!productData) throw new Error("PRODUCT_NOT_FOUND");
      if (productData?.vendor_id !== userData?.id)
        throw new Error("CHANGE_ORDER_STATUS_BY_WRONG_VENDOR");
    }

    if (!isValidStatusTransition(orderItemData?.status, data?.status)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const updateData = { status: data.status };
    if (data.status === "shipped") updateData.shipped_at = new Date();
    if (data.status === "delivered") updateData.delivered_at = new Date();
    if (data.status === "cancelled") updateData.cancelled_at = new Date();

    const result = await orderItemDb.update(updateData, { id: `${id}` }, t);

    if (data?.status === "delivered" || data?.status === "cancelled") {
      const allOrderedItems = await orderItemDb.findAll(
        { order_id: `${orderItemData?.order_id}` },
        [],
        [],
        t,
      );

      const deliveredCount = allOrderedItems.filter(
        (item) => item.status === "delivered",
      ).length;

      const cancelledCount = allOrderedItems.filter(
        (item) => item.status === "cancelled",
      ).length;

      let orderUpdateData = {};
      if (cancelledCount === allOrderedItems.length) {
        orderUpdateData = { status: "cancelled", cancelled_at: new Date() };
      } else if (deliveredCount === allOrderedItems.length) {
        orderUpdateData.status = "full_done";
      } else if (
        allOrderedItems.length > deliveredCount &&
        deliveredCount > 0
      ) {
        orderUpdateData.status = "partially_done";
      } else {
        orderUpdateData.status = "pending";
      }

      await orderDb.update(
        orderUpdateData,
        { id: `${orderItemData?.order_id}` },
        t,
      );
    }

    logger.info("Order item status updated successfully", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      order_item_id: id,
      new_status: data?.status,
    });

    await redisClient.INCREMENT_VERSION(`orders:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Update order status error", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      order_item_id: id,
      error: error.message,
    });
    throw error;
  }
};

// cancelOrderItemById
const cancelOrderItemById = async (item_id, userData, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const orderItemData = await orderItemDb.findOne(
      { id: { [Op.eq]: `${item_id}` } },
      t,
    );
    if (!orderItemData) throw new Error("ORDER_ITEMS_NOT_FOUND");
    if (orderItemData?.status === "cancelled")
      throw new Error("ORDER_ITEM_ALREADY_CANCELLED");

    const productData = await productDb.findOne(
      { id: { [Op.eq]: `${orderItemData?.product_id}` } },
      {},
      [],
      t,
    );
    if (!productData) throw new Error("PRODUCT_NOT_FOUND");

    if (userData?.role === "customer") {
      const customerOrderData = await orderDb.findOne(
        {
          id: `${orderItemData?.order_id}`,
          customer_id: `${userData?.id}`,
        },
        {},
        [],
        t,
      );
      if (!customerOrderData) throw new Error("ORDER_NOT_FOUND");
    }
    if (userData?.role === "vendor") {
      if (productData?.vendor_id !== userData?.id)
        throw new Error("WRONG_VENDOR_ORDER_CANCEL");
    }

    const result = await orderItemDb.update(
      {
        status: "cancelled",
        cancelled_at: new Date(),
      },
      { id: `${item_id}` },
      t,
    );

    if (result[0] === 1) {
      if (productData) {
        await productDb.update(
          {
            stock: productData?.stock + orderItemData?.quantity,
          },
          {
            id: `${orderItemData?.product_id}`,
          },
          t,
        );
      }

      const totalAmountAfterCancelItem = await recalculateOrderTotal(
        orderItemData?.order_id,
        t,
      );
      await orderDb.update(
        { total_amount: totalAmountAfterCancelItem },
        { id: orderItemData?.order_id },
        t,
      );

      const allOrderedItems = await orderItemDb.findAll(
        { order_id: orderItemData?.order_id },
        {},
        [],
        t,
      );

      const cancelledCount = allOrderedItems.filter(
        (item) => item?.status === "cancelled",
      ).length;
      const deliveredCount = allOrderedItems.filter(
        (item) => item?.status === "delivered",
      ).length;

      let orderUpdateData = {};
      if (cancelledCount === allOrderedItems.length) {
        const totalAmountOfCancelledItems = allOrderedItems.reduce(
          (acc, item) => {
            return (
              acc +
              parseInt(item?.quantity) * parseFloat(item?.price_at_purchase)
            );
          },
          0,
        );
        orderUpdateData = {
          status: "cancelled",
          cancelled_at: new Date(),
          total_amount: parseFloat(totalAmountOfCancelledItems.toFixed(2)),
        };
      } else if (deliveredCount === allOrderedItems.length) {
        orderUpdateData = { status: "full_done" };
      } else if (
        allOrderedItems.length > deliveredCount &&
        deliveredCount > 0
      ) {
        orderUpdateData = { status: "partially_done" };
      } else {
        orderUpdateData = { status: "pending" };
      }

      await orderDb.update(orderUpdateData, { id: orderItemData?.order_id }, t);
    }

    logger.info("Order item cancelled successfully", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      order_item_id: item_id,
      cancelled_by: userData?.role,
    });

    await redisClient.INCREMENT_VERSION(`orders:version`);
    await redisClient.INCREMENT_VERSION(`products:version`);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Cancel order error", {
      method: reqUrlMet.method,
      url: reqUrlMet.url,
      user_id: userData?.id,
      order_item_id: item_id,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  getOrder,
  addToOrder,
  getVendorOrders,
  updateOrderStatusById,
  cancelOrderItemById,
};
