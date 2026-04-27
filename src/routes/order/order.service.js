const { Op } = require("sequelize");
const orderDb = require("../../dbUtils/orderDb");
const orderItemDb = require("../../dbUtils/orderItemDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { order_item, product } = require("../../db/models");

let query = {};

// getOrder
const getOrder = async (userData) => {
  let result;

  if (userData?.role === "admin") {
    result = await orderDb.findAll(query);
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
  }

  if (!result || (Array.isArray(result) && result.length === 0)) {
    throw new Error("ORDERS_NOT_FOUND");
  }

  return result;
};

// addToOrder
const addToOrder = async (userData) => {
  let result;

  query = {
    customer_id: {
      [Op.eq]: `${userData?.id}`,
    },
  };
  const existingCartData = await cartDb.findOne(query);

  if (!existingCartData) {
    throw new Error("CART_NOT_FOUND");
  }

  query = {
    cart_id: {
      [Op.eq]: `${existingCartData?.id}`,
    },
  };

  const cartItemData = await cartItemDb.findAll(query);

  if (!cartItemData || cartItemData.length === 0) {
    throw new Error("CART_ITEMS_NOT_FOUND");
  }

  const orderData = {
    customer_id: existingCartData?.customer_id,
    total_amount: existingCartData?.total_amount,
    status: "placed",
  };

  result = await orderDb.create(orderData);

  if (!result) {
    throw new Error("ORDER_CREATION_FAILED");
  }

  for (const item of cartItemData) {
    const orderItemData = {
      order_id: result?.id,
      product_id: item?.product_id,
      quantity: item?.quantity,
      price_at_purchase: item?.unit_price,
    };
    const orderItemResult = await orderItemDb.create(orderItemData);

    if (!orderItemResult) {
      throw new Error("ORDER_ITEM_CREATION_FAILED");
    }
  }

  query = {
    cart_id: {
      [Op.eq]: `${existingCartData?.id}`,
    },
  };

  await cartItemDb.remove(query);

  query = {
    customer_id: {
      [Op.eq]: `${userData?.id}`,
    },
  };

  await cartDb.remove(query);
};

module.exports = {
  getOrder,
  addToOrder,
};
