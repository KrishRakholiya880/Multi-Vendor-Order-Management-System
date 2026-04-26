const cartDb = require("../../dbUtils/cartDb");
const { product, cart_item } = require("../../db/models");
const { Op } = require("sequelize");

// getCart
const getCart = async () => {
  let query = {};
  const result = await cartDb.findAll(query);

  if (!result) {
    throw new Error("CART_NOT_FOUND");
  }

  return result;
};

// addToCart
const addToCart = async (data) => {
  const { body, userData } = data;
  let query = {};
  let newDataObject = {};
  let result;

  query = {
    id: { [Op.eq]: `${body?.product_id}` },
  };
  const productData = await product.findOne({ where: query });

  if (!productData) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  if (productData?.stock === 0) {
    throw new Error("PRODUCT_OUT_OF_STOCK");
  }

  if (productData?.stock < body?.quantity) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  query = {
    customer_id: { [Op.eq]: `${userData?.id}` },
  };

  let existingCartData = await cartDb.findOne(query);

  if (!existingCartData) {
    newDataObject = {
      body: {
        ...body,
        price: productData?.price,
      },
      userData,
    };

    result = await cartDb.create(newDataObject);

    if (!result) {
      throw new Error("CART_NOT_FOUND");
    }
  } else {
    query = {
      cart_id: { [Op.eq]: existingCartData?.id },
      product_id: { [Op.eq]: `${body?.product_id}` },
    };
    const existingProductInCart = await cart_item.findOne({ where: query });

    if (existingProductInCart) {
      let quantityUpdateQuery = {
        quantity: existingProductInCart?.quantity + body?.quantity,
      };
      query = {
        id: { [Op.eq]: existingProductInCart?.id },
      };

      result = await cart_item.update(quantityUpdateQuery, { where: query });

      if (result[0] === 0) {
        throw new Error("CART_UPDATE_FAILED");
      }
    } else {
      newDataObject = {
        cart_id: existingCartData?.id,
        product_id: body?.product_id,
        quantity: body?.quantity,
        unit_price: productData?.price,
      };
      result = await cart_item.create(newDataObject);

      if (!result) {
        throw new Error("CART_NOT_FOUND");
      }
    }

    await cartDb.update(
      {
        total_amount:
          existingCartData?.total_amount + productData?.price * body?.quantity,
      },
      { customer_id: existingCartData?.customer_id },
    );
  }

  return result;
};

module.exports = {
  getCart,
  addToCart,
};
