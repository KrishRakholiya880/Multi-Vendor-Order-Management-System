const { vendor_detail } = require("../db/models");

const findAll = async (query = {}, sortBy, page, limit, transaction) => {
  const offset = (page - 1) * limit;
  const order = sortBy === "asc" ? "ASC" : "DESC";

  try {
    const result = await vendor_detail.findAll({
      where: query,
      // attributes: {
      //   exclude: ["created_at", "updated_at", "deleted_at"],
      // },
      limit,
      offset,
      order: [["created_at", order]],
      transaction,
    });

    return result.map((item) => item.toJSON()) || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const findOne = async (
  query = {},
  attributes = {},
  include = [],
  transaction,
) => {
  try {
    const result = await vendor_detail.findOne({
      where: query,
      attributes,
      include,
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
