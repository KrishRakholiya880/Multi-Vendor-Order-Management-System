const productDb = require("../../dbUtils/productDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { sequelize } = require("../../db/models");
const { product, cart_item, user } = require("../../db/models");
const { Op } = require("sequelize");

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

const recalculateTotalAmount = async (cart_id) => {
  const allCartItems = await cartItemDb.findAll({
    cart_id: { [Op.eq]: cart_id },
  });
  return allCartItems.reduce((total, item) => {
    return total + item?.quantity * parseFloat(item?.unit_price);
  }, 0);
};

// getCart
const getCart = async (userData) => {
  const t = await sequelize.transaction();
  try {
    let result;

    if (userData?.role === "admin") {
      result = await cartDb.findAll(
        {},
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

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// addToCart
const addToCart = async (data) => {
  const t = await sequelize.transaction();
  try {
    const { body, userData } = data;
    let result;

    const productData = await productDb.findOne(
      {
        id: { [Op.eq]: `${body?.product_id}` },
      },
      {},
      [],
      t,
    );

    if (!productData) throw new Error("PRODUCT_NOT_FOUND");

    if (productData?.status === "inactive")
      throw new Error("PRODUCT_UNAVAILABLE");

    if (productData?.stock === 0) throw new Error("PRODUCT_OUT_OF_STOCK");

    if (productData?.stock < body?.quantity)
      throw new Error("INSUFFICIENT_STOCK");

    const existingCartData = await cartDb.findOne(
      {
        customer_id: { [Op.eq]: `${userData?.id}` },
      },
      {},
      [],
      t,
    );

    if (!existingCartData) {
      result = await cartDb.create(
        {
          body: { ...body, price: productData?.price },
          userData,
        },
        t,
      );

      if (!result) throw new Error("CART_NOT_FOUND");
    } else {
      const existingProductInCart = await cartItemDb.findOne(
        {
          cart_id: { [Op.eq]: existingCartData?.id },
          product_id: { [Op.eq]: `${body?.product_id}` },
        },
        [],
        t,
      );

      if (existingProductInCart) {
        result = await cartItemDb.update(
          {
            quantity:
              parseInt(existingProductInCart?.quantity) + body?.quantity,
          },
          { id: { [Op.eq]: existingProductInCart?.id } },
          t,
        );
      } else {
        result = await cartItemDb.create(
          {
            cart_id: existingCartData?.id,
            product_id: body?.product_id,
            quantity: body?.quantity,
            unit_price: productData?.price,
          },
          t,
        );

        if (!result) throw new Error("CART_NOT_FOUND");
      }

      const newTotalAmount = await recalculateTotalAmount(existingCartData?.id);
      await cartDb.update(
        { total_amount: newTotalAmount },
        { customer_id: existingCartData?.customer_id },
        t,
      );
    }

    await t.commit();
    return result;
  } catch (error) {
    awaitt.rollback();
  }
};

// updateProductQuantityById
const updateProductQuantityById = async (product_id, body, userData) => {
  const t = await sequelize.transaction();
  try {
    const customerCartData = await cartDb.findOne(
      {
        customer_id: { [Op.eq]: `${userData?.id}` },
      },
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

    const newTotalAmount = await recalculateTotalAmount(customerCartData?.id);
    await cartDb.update(
      { total_amount: Number(newTotalAmount) },
      { id: { [Op.eq]: `${customerCartData?.id}` } },
      t,
    );

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// clearCart
const clearCart = async (userData) => {
  const t = await sequelize.transaction();
  try {
    const existingCustomerCart = await cartDb.findOne(
      {
        customer_id: { [Op.eq]: `${userData?.id}` },
      },
      {},
      [],
      t,
    );
    if (!existingCustomerCart) throw new Error("CART_NOT_FOUND");

    await cartItemDb.remove(
      {
        cart_id: { [Op.eq]: `${existingCustomerCart?.id}` },
      },
      t,
    );

    const result = await cartDb.remove(
      {
        customer_id: { [Op.eq]: `${userData?.id}` },
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

// removeCartProductById
const removeCartProductById = async (product_id, userData) => {
  const t = await sequelize.transaction();
  try {
    const existingCustomerCart = await cartDb.findOne(
      {
        customer_id: { [Op.eq]: `${userData?.id}` },
      },
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
    );
    await cartDb.update(
      { total_amount: Number(newTotalAmount) },
      { customer_id: { [Op.eq]: `${userData?.id}` } },
      t,
    );

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
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
