const { user } = require("../db/models");

// findOne
const findOne = async (query = {}) => {
  try {
    const result = await user.findOne({
      where: query,
    });
    return result;
  } catch (error) {
    console.log(error.message || error);
  }
};

// create
const create = async (body) => {
  try {
    const result = await user.create(body);
    return result.toJSON();
  } catch (error) {
    console.log(error.message || error);
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
    console.log(error.message || error);
  }
};

module.exports = { findOne, create, update };
