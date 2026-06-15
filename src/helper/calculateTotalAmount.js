const { Op } = require("sequelize");
const cartItemDb = require("../dbUtils/cartItemDb");
const orderItemDb = require("../dbUtils/orderItemDb");

const calculateTotalAmount = async (flag, id, t) => {
  let dbItems = [];

  if (flag === "cart") {
    dbItems = await cartItemDb.findAll(
      { cart_id: { [Op.eq]: id } },
      ["quantity", "unit_price"],
      [],
      t,
    );
  } else if (flag === "order") {
    dbItems = await orderItemDb.findAll(
      {
        order_id: { [Op.eq]: id },
        status: { [Op.ne]: "cancelled" },
      },
      ["quantity", "price_at_purchase"],
      [],
      t,
    );
  }

  const rawTotal = dbItems.reduce((acc, item) => {
    const qty = parseInt(item?.quantity) || 0;

    const priceField =
      flag === "cart" ? item?.unit_price : item?.price_at_purchase;
    const price = parseFloat(priceField) || 0;

    return acc + qty * price;
  }, 0);

  return parseFloat(rawTotal.toFixed(2));
};

module.exports = calculateTotalAmount;
