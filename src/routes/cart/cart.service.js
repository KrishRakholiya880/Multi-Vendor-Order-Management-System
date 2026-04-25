const cartDb = require("../../dbUtils/cartDb");

// getCart
const getCart = async () => {
  let query = {};
  const result = await cartDb.findAll(query);

  if (!result) {
    throw new Error("CART_NOT_FOUND");
  }

  return result;
};

module.exports = {
  getCart,
};
