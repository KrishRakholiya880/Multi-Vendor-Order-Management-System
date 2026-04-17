const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const productDb = require("../../dbUtils/productDb");

// getProducts
const getProducts = async (search, page = 1, limit = 30) => {
  // const t = await sequelize.transaction()

  const query = {
    [Op.or]: [
      { name: { [Op.like]: `${search}` } },
      { description: { [Op.like]: `${search}` } },
    ],
  };

  const result = await productDb.findAll(query, page, limit, {});

  if (!result || (Array.isArray(result) && result.length === 0)) {
    throw new Error("PRODUCTS_NOT_FOUND");
  }

  return result;
};

module.exports = {
  getProducts,
};
