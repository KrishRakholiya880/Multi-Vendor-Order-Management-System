const { cart } = require("../db/models");

const findAll = async (query = {}) => {
  try {
    const result = await cart.findAll({
      where: query,
    });
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = {
  findAll,
};
