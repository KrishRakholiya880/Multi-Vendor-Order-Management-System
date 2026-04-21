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

// createUser
const createUser = async (req, res, next) => {
  const body = req.body;
  try {
    const result = await userService.createUser(body);

    return res
      .status(201)
      .json({ status: true, message: "User created!!!", result });
  } catch (error) {
    next(error);
  }
};

// updateUserById
const updateUserById = async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;

  let updateData = {};

  for (const el of Object.keys(body)) {
    if (body[el] !== undefined) {
      updateData[el] = body[el];
    }
  }

  console.log(updateData);

  try {
    const result = await userService.updateUserById(updateData, id);

    return res.status(200).json({ status: true, message: "User updated!!!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserById,
};
