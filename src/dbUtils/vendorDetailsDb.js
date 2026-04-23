const { vendor_detail, user } = require("../db/models");

const findAll = async (query = {}) => {
  try {
    const result = await vendor_detail.findAll();

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const findOne = async (query = {}) => {
  try {
    const result = await vendor_detail.findOne({
      where: query,
      include: {
        model: user,
        as: "user_data",
      },
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (data) => {
  try {
    const result = await vendor_detail.create(data);

    return result.toJSON() || result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (data, query) => {
  try {
    const result = await vendor_detail.update(data, {
      where: query,
    });

    return result.toJSON() || result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
};
