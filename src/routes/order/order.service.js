const { Op } = require("sequelize");
const orderDb = require("../../dbUtils/orderDb");
const orderItemDb = require("../../dbUtils/orderItemDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { order_item, product } = require("../../db/models");

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
  let query = {};

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

  for (const item of cartItemData) {
    const orderItemData = {
      order_id: result?.id,
      product_id: item?.product_id,
      quantity: item?.quantity,
      price_at_purchase: item?.unit_price,
    };

    await orderItemDb.create(orderItemData);

    const productData = await product.findOne({
      where: { id: { [Op.eq]: `${item?.product_id}` } },
    });

    if (!productData) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (productData?.stock < item?.quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    await product.update(
      { stock: productData?.stock - item?.quantity },
      { where: { id: item?.product_id } },
    );
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

// getVendorOrders
const getVendorOrders = async (userData) => {
  let result;

  result = await orderDb.findAll(
    {},
    [],
    [
      {
        model: order_item,
        as: "order_items",
        attributes: ["id", "order_id", "quantity", "price_at_purchase"],
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

module.exports = {
  getOrder,
  addToOrder,
  getVendorOrders,
};
