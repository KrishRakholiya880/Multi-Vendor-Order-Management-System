const { Op } = require("sequelize");
const orderDb = require("../../dbUtils/orderDb");

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

module.exports = {
  getOrder,
};
