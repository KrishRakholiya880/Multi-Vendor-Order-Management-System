const { Op } = require("sequelize");
const productDb = require("../../dbUtils/productDb");
const orderDb = require("../../dbUtils/orderDb");
const orderItemDb = require("../../dbUtils/orderItemDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
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

  if (newStatus === "cancelled") {
    return oldStatus !== "delivered";
  }

  return newRank > oldRank;
};

// getOrder
const getOrder = async (userData) => {
  let result;
  let query = {};

  if (userData?.role === "admin") {
    result = await orderDb.findAll(
      query,
      ["id", "customer_id", "total_amount"],
      [
        {
          model: order_item,
          as: "order_items",
          attributes: ["id", "order_id", "quantity", "price_at_purchase"],
          include: [
            {
              model: product,
              as: "product_info",
              attributes: ["id", "name", "description", "status", "price"],
            },
          ],
        },
      ],
    );
  } else {
    query = {
      customer_id: {
        [Op.eq]: `${userData?.id}`,
      },
    };

    const customerOrderData = await orderDb.findOne(query);

    if (!customerOrderData) {
      throw new Error("ORDER_NOT_FOUND");
    }

    query = {
      id: {
        [Op.eq]: `${customerOrderData?.id}`,
      },
    };

    result = await orderDb.findOne(
      query,
      ["id", "customer_id", "total_amount"],
      [
        {
          where: { status: { [Op.ne]: `cancelled` } },
          required: false,
          model: order_item,
          as: "order_items",
          attributes: [
            "id",
            "order_id",
            "quantity",
            "price_at_purchase",
            "placed_at",
          ],
          include: [
            {
              model: product,
              as: "product_info",
              attributes: ["id", "name", "description", "status", "price"],
            },
          ],
        },
      ],
    );
  }

  if (!result || (Array.isArray(result) && result.length === 0)) {
    throw new Error("ORDERS_NOT_FOUND");
  }

  return result;
};

// addToOrder
const addToOrder = async (userData) => {
  let result;
  let query = {};

  const existingCartData = await cartDb.findOne({
    customer_id: `${userData?.id}`,
  });

  if (!existingCartData) {
    throw new Error("CART_NOT_FOUND");
  }

  const cartItemData = await cartItemDb.findAll({
    cart_id: `${existingCartData?.id}`,
  });

  if (!cartItemData || cartItemData.length === 0) {
    throw new Error("CART_ITEMS_NOT_FOUND");
  }

  const existingOrder = await orderDb.findOne({
    customer_id: `${userData?.id}`,
  });

  if (!existingOrder) {
    const orderData = {
      customer_id: existingCartData?.customer_id,
      total_amount: parseFloat(existingCartData?.total_amount).toFixed(2),
    };
    result = await orderDb.create(orderData);
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
    );
  }

  for (const item of cartItemData) {
    if (existingOrder) {
      const existingOrderItem = await orderItemDb.findOne({
        order_id: { [Op.eq]: result?.id },
        product_id: { [Op.eq]: `${item?.product_id}` },
      });

      if (existingOrderItem) {
        await orderItemDb.update(
          { quantity: existingOrderItem?.quantity + item?.quantity },
          { id: { [Op.eq]: existingOrderItem?.id } },
        );
      } else {
        await orderItemDb.create({
          order_id: result?.id,
          product_id: item?.product_id,
          quantity: item?.quantity,
          price_at_purchase: parseFloat(item?.unit_price).toFixed(2),
        });
      }
    } else {
      await orderItemDb.create({
        order_id: result?.id,
        product_id: item?.product_id,
        quantity: item?.quantity,
        price_at_purchase: parseFloat(item?.unit_price).toFixed(2),
      });
    }

    const productData = await productDb.findOne({
      id: `${item?.product_id}`,
    });

    if (!productData) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    await productDb.update(
      { stock: productData?.stock - item?.quantity },
      { id: item?.product_id },
    );
  }

  query = {
    cart_id: { [Op.eq]: `${existingCartData?.id}` },
  };
  await cartItemDb.remove(query);

  query = {
    customer_id: { [Op.eq]: `${userData?.id}` },
  };
  await cartDb.remove(query);

  return result;
};

// getVendorOrders
const getVendorOrders = async (userData) => {
  let result;

  result = await orderDb.findAll(
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
  );

  if (!result || result.length === 0) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return result;
};

// updateOrderStatusById
const updateOrderStatusById = async (id, data, userData) => {
  let query = {};
  let result;

  query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const orderData = await orderItemDb.findOne(query);

  if (!orderData) {
    throw new Error("ORDER_ITEM_NOT_FOUND");
  }

  const isValidStatus = isValidStatusTransition(orderData?.status, data.status);

  if (!isValidStatus) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  const updateData = { status: data?.status };

  if (data?.status === "shipped") {
    updateData.shipped_at = new Date();
  }

  if (data?.status === "delivered") {
    updateData.delivered_at = new Date();
  }

  if (data?.status === "cancelled") {
    updateData.cancelled_at = new Date();
  }

  if (userData?.role === "vendor") {
    query = {
      id: {
        [Op.eq]: `${orderData?.product_id}`,
      },
    };
    const productDetails = await productDb.findOne(query);

    if (productDetails?.vendor_id !== userData?.id) {
      throw new Error("CHANGE_ORDER_STATUS_WRONG_VENDOR");
    }
  }

  query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  result = await orderItemDb.update(updateData, query);
  return result;
};

// cancelOrderById
const cancelOrderById = async (item_id, userData) => {
  let result;

  const orderItemData = await orderItemDb.findOne({
    id: { [Op.eq]: `${item_id}` },
  });

  if (!orderItemData) {
    throw new Error("ORDER_ITEMS_NOT_FOUND");
  }

  if (orderItemData?.status === "cancelled") {
    throw new Error("ORDER_ITEM_ALREADY_CANCELLED");
  }

  if (userData?.role === "customer") {
    const orderData = await orderDb.findOne({
      customer_id: { [Op.eq]: `${userData?.id}` },
    });

    if (!orderData) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const orderItemsData = await orderItemDb.findAll({
      order_id: { [Op.eq]: `${orderData?.id}` },
    });

    if (!orderItemsData || orderItemsData.length === 0) {
      throw new Error("ORDER_ITEMS_NOT_FOUND");
    }
  } else if (userData?.role === "vendor") {
    const productData = await productDb.findOne({
      id: { [Op.eq]: `${orderItemData?.product_id}` },
    });

    if (productData?.vendor_id !== userData?.id) {
      throw new Error("WRONG_VENDOR_ORDER_CANCEL");
    }
  }

  result = await orderItemDb.update(
    {
      status: "cancelled",
      cancelled_at: new Date(),
    },
    { id: `${item_id}` },
  );

  if (result[0] === 1) {
    const productData = await productDb.findOne({
      id: { [Op.eq]: `${orderItemData?.product_id}` },
    });

    if (productData) {
      await productDb.update(
        { stock: productData?.stock + orderItemData?.quantity },
        { id: `${orderItemData?.product_id}` },
      );
    }

    const orderData = await orderDb.findOne({
      id: { [Op.eq]: `${orderItemData?.order_id}` },
    });

    if (!orderData) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const afterCancelOrderAmount = (
      parseFloat(orderData?.total_amount) -
      parseFloat(orderItemData?.price_at_purchase) *
        parseFloat(orderItemData?.quantity)
    ).toFixed(2);

    await orderDb.update(
      { total_amount: afterCancelOrderAmount },
      { id: `${orderItemData?.order_id}` },
    );
  }

  return result;
};

module.exports = {
  getOrder,
  addToOrder,
  getVendorOrders,
  updateOrderStatusById,
  cancelOrderById,
};
