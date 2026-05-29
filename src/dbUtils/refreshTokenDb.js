const { refresh_token } = require("../db/models");

const findOne = async (query = {}, transaction = null) => {
  try {
    const result = await refresh_token.findOne({
      where: query,
      transaction,
    });
    return result.toJSON() || null;
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (data, transaction = null) => {
  try {
    await refresh_token.create(data, { transaction });
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (data, query = {}, transaction = null) => {
  await refresh_token.update(data, {
    where: query,
    transaction,
  });
};

const remove = async (query = {}, transaction = null) => {
  await refresh_token.destroy({
    where: query,
    transaction,
  });
};

module.exports = {
  findOne,
  create,
  update,
  remove,
};
