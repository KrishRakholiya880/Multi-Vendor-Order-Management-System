const { Op } = require("sequelize");
const productDb = require("../../dbUtils/productDb");
const orderDb = require("../../dbUtils/orderDb");
const orderItemDb = require("../../dbUtils/orderItemDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { sequelize } = require("../../db/models");
const { order_item, product } = require("../../db/models");

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
  if (newStatus === "cancelled") return oldStatus !== "delivered";
  return newRank > oldRank;
};

const orderItemsInclude = (withCancelFilter = false) => [
  {
    model: order_item,
    as: "order_items",
    ...(withCancelFilter && {
      where: { status: { [Op.ne]: "cancelled" } },
      required: false,
    }),
    attributes: [
      "id",
      "order_id",
      "quantity",
      "price_at_purchase",
      ...(withCancelFilter ? ["placed_at"] : []),
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

const orderAttributes = ["id", "customer_id", "total_amount"];

// getOrder
const getOrder = async (userData) => {
  const t = await sequelize.transaction();
  try {
    let result;

    if (userData?.role === "admin") {
      result = await orderDb.findAll(
        {},
        orderAttributes,
        orderItemsInclude(),
        t,
      );
    } else {
      const customerOrderData = await orderDb.findOne(
        {
          customer_id: { [Op.eq]: `${userData?.id}` },
        },
        {},
        [],
        t,
      );
      if (!customerOrderData) throw new Error("ORDER_NOT_FOUND");

      result = await orderDb.findOne(
        { id: { [Op.eq]: `${customerOrderData?.id}` } },
        orderAttributes,
        orderItemsInclude(true),
        t,
      );
    }

    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("ORDERS_NOT_FOUND");
    }

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// addToOrder
const addToOrder = async (userData) => {
  const t = await sequelize.transaction();
  try {
    const existingCartData = await cartDb.findOne(
      {
        customer_id: `${userData?.id}`,
      },
      {},
      [],
      t,
    );
    if (!existingCartData) throw new Error("CART_NOT_FOUND");

    const cartItemData = await cartItemDb.findAll(
      {
        cart_id: `${existingCartData?.id}`,
      },
      {},
      t,
    );
    if (!cartItemData || cartItemData.length === 0)
      throw new Error("CART_ITEMS_NOT_FOUND");

    const existingOrder = await orderDb.findOne(
      {
        customer_id: `${userData?.id}`,
      },
      {},
      [],
      t,
    );
    let result;

    if (!existingOrder) {
      result = await orderDb.create(
        {
          customer_id: existingCartData?.customer_id,
          total_amount: parseFloat(existingCartData?.total_amount).toFixed(2),
        },
        t,
      );
    } else {
      result = existingOrder;
      await orderDb.update(
        {
          total_amount: (
            parseFloat(existingOrder?.total_amount) +
            parseFloat(existingCartData?.total_amount)
          ).toFixed(2),
        },
        { id: { [Op.eq]: existingOrder?.id } },
        t,
      );
    }

    for (const item of cartItemData) {
      if (existingOrder) {
        const existingOrderItem = await orderItemDb.findOne(
          {
            order_id: { [Op.eq]: result?.id },
            product_id: { [Op.eq]: `${item?.product_id}` },
          },
          t,
        );

        if (existingOrderItem) {
          await orderItemDb.update(
            { quantity: existingOrderItem?.quantity + item?.quantity },
            { id: { [Op.eq]: existingOrderItem?.id } },
            t,
          );
        } else {
          await orderItemDb.create(
            {
              order_id: result?.id,
              product_id: item?.product_id,
              quantity: item?.quantity,
              price_at_purchase: parseFloat(item?.unit_price).toFixed(2),
            },
            t,
          );
        }
      } else {
        await orderItemDb.create(
          {
            order_id: result?.id,
            product_id: item?.product_id,
            quantity: item?.quantity,
            price_at_purchase: parseFloat(item?.unit_price).toFixed(2),
          },
          t,
        );
      }

      const productData = await productDb.findOne(
        {
          id: `${item?.product_id}`,
        },
        {},
        [],
        t,
      );
      if (!productData) throw new Error("PRODUCT_NOT_FOUND");

      await productDb.update(
        { stock: productData?.stock - item?.quantity },
        { id: item?.product_id },
        t,
      );
    }

    await cartItemDb.remove(
      {
        cart_id: { [Op.eq]: `${existingCartData?.id}` },
      },
      t,
    );
    await cartDb.remove({ customer_id: { [Op.eq]: `${userData?.id}` } }, t);

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// getVendorOrders
const getVendorOrders = async (userData) => {
  const t = await sequelize.transaction();
  try {
    const result = await orderDb.findAll(
      {},
      ["id", "customer_id", "status", "created_at"],
      [
        {
          model: order_item,
          as: "order_items",
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
              where: { vendor_id: userData?.id },
              attributes: ["id", "name", "description", "price", "status"],
            },
          ],
        },
      ],
      t,
    );

    if (!result || result.length === 0) throw new Error("ORDER_NOT_FOUND");

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// updateOrderStatusById
const updateOrderStatusById = async (id, data, userData) => {
  const t = await sequelize.transaction();
  try {
    const orderData = await orderItemDb.findOne(
      { id: { [Op.eq]: `${id}` } },
      t,
    );
    if (!orderData) throw new Error("ORDER_ITEM_NOT_FOUND");

    if (!isValidStatusTransition(orderData?.status, data.status)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const updateData = { status: data?.status };
    if (data?.status === "shipped") updateData.shipped_at = new Date();
    if (data?.status === "delivered") updateData.delivered_at = new Date();
    if (data?.status === "cancelled") updateData.cancelled_at = new Date();

    if (userData?.role === "vendor") {
      const productDetails = await productDb.findOne(
        {
          id: { [Op.eq]: `${orderData?.product_id}` },
        },
        {},
        [],
        t,
      );
      if (productDetails?.vendor_id !== userData?.id) {
        throw new Error("CHANGE_ORDER_STATUS_BY_WRONG_VENDOR");
      }
    }

    const result = await orderItemDb.update(
      updateData,
      {
        id: { [Op.eq]: `${id}` },
      },
      t,
    );

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// cancelOrderById
const cancelOrderById = async (item_id, userData) => {
  const t = await sequelize.transaction();
  try {
    const orderItemData = await orderItemDb.findOne(
      {
        id: { [Op.eq]: `${item_id}` },
      },
      t,
    );

    if (!orderItemData) throw new Error("ORDER_ITEMS_NOT_FOUND");

    if (orderItemData?.status === "cancelled")
      throw new Error("ORDER_ITEM_ALREADY_CANCELLED");

    if (userData?.role === "customer") {
      const orderData = await orderDb.findOne(
        {
          customer_id: { [Op.eq]: `${userData?.id}` },
        },
        {},
        [],
        t,
      );

      if (!orderData) throw new Error("ORDER_NOT_FOUND");

      const orderItemsData = await orderItemDb.findAll(
        {
          order_id: { [Op.eq]: `${orderData?.id}` },
        },
        t,
      );

      if (!orderItemsData || orderItemsData.length === 0)
        throw new Error("ORDER_ITEMS_NOT_FOUND");
    } else if (userData?.role === "vendor") {
      const productData = await productDb.findOne(
        {
          id: { [Op.eq]: `${orderItemData?.product_id}` },
        },
        {},
        [],
        t,
      );

      if (productData?.vendor_id !== userData?.id)
        throw new Error("WRONG_VENDOR_ORDER_CANCEL");
    }

    const result = await orderItemDb.update(
      { status: "cancelled", cancelled_at: new Date() },
      { id: `${item_id}` },
      t,
    );

    if (result[0] === 1) {
      const productData = await productDb.findOne(
        {
          id: { [Op.eq]: `${orderItemData?.product_id}` },
        },
        {},
        [],
        t,
      );
      if (productData) {
        await productDb.update(
          { stock: productData?.stock + orderItemData?.quantity },
          { id: `${orderItemData?.product_id}` },
          t,
        );
      }

      const orderData = await orderDb.findOne(
        {
          id: { [Op.eq]: `${orderItemData?.order_id}` },
        },
        {},
        [],
        t,
      );
      if (!orderData) throw new Error("ORDER_NOT_FOUND");

      await orderDb.update(
        {
          total_amount: (
            parseFloat(orderData?.total_amount) -
            parseFloat(orderItemData?.price_at_purchase) *
              parseFloat(orderItemData?.quantity)
          ).toFixed(2),
        },
        { id: `${orderItemData?.order_id}` },
        t,
      );
    }

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  getOrder,
  addToOrder,
  getVendorOrders,
  updateOrderStatusById,
  cancelOrderById,
};
