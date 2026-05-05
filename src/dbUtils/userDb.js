const { user, vendor_detail, product } = require("../db/models");

// findOne
const findOne = async (query = {}, attributes = {}, include = []) => {
  try {
    const result = await user.findOne({
      where: query,
      attributes,
      ...(include.length > 0 && { include }),
    });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// findAll
const findAll = async (query = {}, page, limit, include = []) => {
  const offset = (page - 1) * limit;
  try {
    const result = await user.findAll({
      where: query,
      limit,
      offset,
      ...(include.length > 0 && { include }),
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// create
const create = async (data) => {
  try {
    const result = await user.create(data);

    return result.toJSON();
  } catch (error) {
    console.log(error?.message || error);
  }
};

// update
const update = async (data, query) => {
  try {
    const result = await user.update(data, {
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// remove
const remove = async (query) => {
  try {
    const result = await user.destroy({
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = {
  findOne,
  findAll,
  create,
  update,
  remove,
};
