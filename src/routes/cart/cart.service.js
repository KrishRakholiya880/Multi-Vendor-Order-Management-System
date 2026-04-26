const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const { product, cart_item } = require("../../db/models");
const { Op } = require("sequelize");

// getCart
const getCart = async (userData) => {
  let query = {};
  let result;

  if (userData?.role === "admin") {
    result = await cartDb.findAll(query, {
      model: cart_item,
      as: "cart_items",
    });
  } else {
    query = {
      customer_id: {
        [Op.eq]: `${userData?.id}`,
      },
    };

    const customerCartData = await cartDb.findOne(query);

    if (!customerCartData) {
      throw new Error("CART_NOT_FOUND");
    }

    query = {
      id: {
        [Op.eq]: `${customerCartData?.id}`,
      },
    };

    result = await cartDb.findOne(query, {
      model: cart_item,
      as: "cart_items",
    });
  }

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
    const existingProductInCart = await cartItemDb.findOne(query);

    if (existingProductInCart) {
      let quantityUpdateQuery = {
        quantity: existingProductInCart?.quantity + body?.quantity,
      };
      query = {
        id: { [Op.eq]: existingProductInCart?.id },
      };

      result = await cartItemDb.update(quantityUpdateQuery, query);

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
      result = await cartItemDb.create(newDataObject);

      if (!result) {
        throw new Error("CART_NOT_FOUND");
      }
    }

    const allCartItems = await cartItemDb.findAll({
      cart_id: { [Op.eq]: existingCartData?.id },
    });

    const newTotalAmount = allCartItems.reduce((total, item) => {
      return total + item?.quantity * parseFloat(item?.unit_price);
    }, 0);

    await cartDb.update(
      { total_amount: newTotalAmount },
      { customer_id: existingCartData?.customer_id },
    );
  }

  return result;
};

// updateProductQuantityById
const updateProductQuantityById = async (product_id, body, userData) => {
  let query = {};
  let result;

  if (userData?.role === "customer") {
    query = {
      customer_id: {
        [Op.eq]: `${userData?.id}`,
      },
    };

    const customerCartData = await cartDb.findOne(query);

    if (!customerCartData) {
      throw new Error("CART_NOT_FOUND");
    }

    query = {
      cart_id: { [Op.eq]: `${customerCartData?.id}` },
      product_id: { [Op.eq]: `${product_id}` },
    };

    const cartProduct = await cartItemDb.findOne(query);

    if (!cartProduct) {
      throw new Error("CART_PRODUCT_NOT_FOUND");
    }

    result = await cartItemDb.update({ quantity: body?.quantity }, query);

    query = {
      cart_id: {
        [Op.eq]: `${customerCartData?.id}`,
      },
    };

    const productsWithSameCartId = await cartItemDb.findAll(query);

    const newTotalAmount = productsWithSameCartId.reduce((total, product) => {
      return total + product?.quantity * parseFloat(product?.unit_price);
    }, 0);

    query = {
      id: {
        [Op.eq]: `${customerCartData?.id}`,
      },
    };

    await cartDb.update({ total_amount: Number(newTotalAmount) }, query);

    return result;
  }

  return result;
};

// clearCart
const clearCart = async (userData) => {
  let query = {};
  let result;

  query = {
    customer_id: {
      [Op.eq]: `${userData?.id}`,
    },
  };

  const existingCustomerCart = await cartDb.findOne(query);

  if (!existingCustomerCart) {
    throw new Error("CART_NOT_FOUND");
  }

  query = {
    cart_id: {
      [Op.eq]: `${existingCustomerCart?.id}`,
    },
  };

  const cartItemsData = await cartItemDb.findAll(query);

  if (cartItemsData) {
    await cartItemDb.remove(query);

    query = {
      customer_id: {
        [Op.eq]: `${userData?.id}`,
      },
    };

    result = await cartDb.remove(query);

    return result;
  }
};

module.exports = {
  getCart,
  addToCart,
  updateProductQuantityById,
  clearCart,
};
