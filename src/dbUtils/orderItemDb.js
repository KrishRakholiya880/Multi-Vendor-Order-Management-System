const { order_item } = require("../db/models");

const create = async (data) => {
  try {
    const result = await order_item.create(data);

    return result.map((item) => item.toJSON()) || result.toJSON();
  } catch (error) {
    console.log(error.message || error);
  }
};

module.exports = {
  create,
};
