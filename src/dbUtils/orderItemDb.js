const { order_item } = require("../db/models");

const findOne = async (query) => {
  try {
    const result = await order_item.findOne({ where: query });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const create = async (data) => {
  try {
    const result = await order_item.create(data);

    return result.map((item) => item.toJSON()) || result.toJSON();
  } catch (error) {
    console.log(error.message || error);
  }
};

const update = async (data, query) => {
  try {
    const result = await order_item.update(data, {
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error.message || error);
  }
};

module.exports = {
  findOne,
  create,
  update,
};
