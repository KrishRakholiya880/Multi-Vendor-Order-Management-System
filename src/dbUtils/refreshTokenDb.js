const { refresh_token } = require("../db/models");

const findOne = async (query = {}, transaction = undefined) => {
  try {
    const result = await refresh_token.findOne({
      where: query,
      transaction,
    });
    return result.toJSON();
  } catch (error) {
    console.log(error?.message || error);
  }
};

const create = async (data, transaction = undefined) => {
  try {
    await refresh_token.create(data, { transaction });
  } catch (error) {
    console.log(error?.message || error);
  }
};

const update = async (data, query = {}, transaction = undefined) => {
  await refresh_token.update(data, {
    where: query,
    transaction,
  });
};

const remove = async (query = {}, transaction = undefined) => {
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
