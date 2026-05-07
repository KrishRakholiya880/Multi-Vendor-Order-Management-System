const { vendor_detail, user } = require("../db/models");

const findAll = async (query = {}, transaction) => {
  try {
    const result = await vendor_detail.findAll({
      where: query,
      transaction,
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const findOne = async (query = {}, transaction) => {
  try {
    const result = await vendor_detail.findOne({
      where: query,
      include: {
        model: user,
        as: "user_data",
      },
      transaction,
    });

    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (data, transaction) => {
  try {
    const result = await vendor_detail.create(data, { transaction });

    return result.toJSON() || result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (data, query = {}, transaction) => {
  try {
    const result = await vendor_detail.update(data, {
      where: query,
      transaction,
    });

    return result;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const remove = async (query, transaction) => {
  try {
    const result = await vendor_detail.destroy({
      where: query,
      transaction,
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
