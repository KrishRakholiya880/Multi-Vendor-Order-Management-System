const { user } = require("../db/models");

// findOne
const findOne = async (query = {}) => {
  try {
    const result = await user.findOne({
      where: query,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

// findAll
const findAll = async (query = {}, page, limit) => {
  const offset = (page - 1) * limit;
  try {
    const result = await user.findAll({
      where: query,
      limit,
      offset,
    });

    return result;
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
