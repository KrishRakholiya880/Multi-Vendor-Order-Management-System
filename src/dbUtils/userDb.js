const { user } = require("../db/models");

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

module.exports = {
  findAll,
};
