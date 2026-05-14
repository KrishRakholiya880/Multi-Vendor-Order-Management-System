const userService = require("./user.service");

// getUsers
const getUsers = async (req, res, next) => {
  const { role, status, sortBy, page, limit } = req.query;
  try {
    const result = await userService.getUsers(
      role,
      status,
      sortBy,
      Number(page) || 1,
      Number(limit) || 30,
    );

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// getUserById
const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await userService.getUserById(id);

    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

// createUser
const createUser = async (req, res, next) => {
  const body = req.body;
  const { url, method } = req;

  try {
    const result = await userService.createUser(body, { url, method });

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
  const { url, method } = req;

  let updateData = {};

  for (const el of Object.keys(body)) {
    if (body[el] !== undefined) {
      updateData[el] = body[el];
    }
  }

  try {
    const result = await userService.updateUserById(updateData, id, {
      url,
      method,
    });

    return res.status(200).json({ status: true, message: "User updated!!!" });
  } catch (error) {
    next(error);
  }
};

// changeUserStatusById
const changeUserStatusById = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const { url, method } = req;

  try {
    const result = await userService.changeUserStatusById(id, status, {
      url,
      method,
    });

    return res
      .status(200)
      .json({ status: true, message: "Users status changed!!!" });
  } catch (error) {
    next(error);
  }
};

// removeUserById
const removeUserById = async (req, res, next) => {
  const { id } = req.params;
  const { url, method } = req;

  try {
    const result = await userService.removeUserById(id, { url, method });

    return res.status(200).json({ status: true, message: "User removed!!!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  changeUserStatusById,
  removeUserById,
};
