const userService = require("./user.service");

// getUsers
const getUsers = async (req, res, next) => {
  const { search, page, limit } = req.query;
  try {
    const result = await userService.getUsers(
      search,
      Number(page) || 1,
      Number(limit) || 30,
    );

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
