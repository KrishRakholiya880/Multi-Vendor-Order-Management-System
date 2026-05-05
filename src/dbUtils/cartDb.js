const { cart, cart_item } = require("../db/models");

const findAll = async (query = {}, attributes = [], include = []) => {
  try {
    const result = await cart.findAll({
      where: query,
      ...(attributes.length > 0 && { attributes }),
      ...(include.length > 0 && { include }),
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const findOne = async (query = {}, attributes = [], include = []) => {
  try {
    const result = await cart.findOne({
      where: query,
      ...(attributes.length > 0 && { attributes }),
      ...(include.length > 0 && { include }),
    });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (data) => {
  const { body, userData } = data;
  let cartData = {};

  try {
    cartData = {
      customer_id: userData?.id,
      total_amount: body?.quantity * body?.price,
    };
    const cartResult = await cart.create(cartData);

    cartData = {
      cart_id: cartResult.toJSON()?.id,
      product_id: body?.product_id,
      quantity: body?.quantity,
      unit_price: body?.price,
    };
    const cartItemsResult = await cart_item.create(cartData);

    return {
      cartResult: cartResult.toJSON(),
      cartItemsResult: cartItemsResult.toJSON(),
    };
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (data, query) => {
  try {
    const result = await cart.update(data, {
      where: query,
    });
    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const remove = async (query) => {
  try {
    const result = await cart.destroy({
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  remove,
};
