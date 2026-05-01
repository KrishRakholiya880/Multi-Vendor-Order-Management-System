const { order } = require("../db/models");

const findAll = async (query, attributes = [], include = []) => {
  try {
    const result = await order.findAll({
      where: query,
      ...(attributes.length > 0 && { attributes }),
      ...(include.length > 0 && { include }),
    });
    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const findOne = async (query, attributes = [], include = []) => {
  try {
    const result = await order.findOne({
      where: query,
      ...(attributes.length > 0 && { attributes }),
      ...(include.length > 0 && { include }),
    });
    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

const create = async (data) => {
  try {
    const result = await order.create(data);

    return result.toJSON() || null;
  } catch (error) {
    console.log(error.message || error);
  }
};

module.exports = {
  findAll,
  findOne,
  create,
};
