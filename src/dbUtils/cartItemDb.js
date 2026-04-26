const { cart_item } = require("../db/models");

const findAll = async (query, include) => {
  try {
    const result = await cart_item.findAll({
      where: query,
      include,
    });

    return result.map((item) => item.toJSON()) || result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const findOne = async (query, include) => {
  try {
    const result = await cart_item.findOne({
      where: query,
      include,
    });

    return result.toJSON() || result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (body) => {
  try {
    const result = await cart_item.create(body);

    return result.toJSON();
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (body, query) => {
  try {
    const result = await cart_item.update(body, {
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const remove = async (query) => {
  try {
    const result = await cart_item.destroy({
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
