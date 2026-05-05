const { Op } = require("sequelize");
const userDb = require("../../dbUtils/userDb");
const refreshTokenDb = require("../../dbUtils/refreshTokenDb");
const productDb = require("../../dbUtils/productDb");
const { hashPassword } = require("../../helper/bcrypt");

// getUsers
const getUsers = async (role, status, sortBy = "desc", page, limit) => {
  let query = {};
  if (role || status) {
    if (role) {
      query.role = { [Op.like]: `${role}` };
    }
    if (status) {
      query.status = { [Op.like]: `${status}` };
    }
  }

  const result = await userDb.findAll(query, sortBy, page, limit);

  if (!result) {
    throw new Error("USER_NOT_FOUND");
  }

  return result;
};

// getUserById
const getUserById = async (search, page, limit) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const result = await userDb.findOne(query);

  if (!result) {
    throw new Error("USER_NOT_FOUND");
  }

  return result;
};

// createUser
const createUser = async (body) => {
  const { email, password } = body;

  const query = {
    email: {
      [Op.eq]: `${email}`,
    },
  };
  const isExists = await userDb.findOne(query);

  if (isExists) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const newBody = {
    hash_password: hashedPassword,
    ...body,
  };

  const result = await userDb.create(newBody);

  if (!result) {
    throw new Error("USER_NOT_FOUND");
  }

  delete result.created_at;
  delete result.updated_at;
  delete result.hash_password;

  return result;
};

// updateUserById
const updateUserById = async (data, id) => {
  const { password } = data;

  let query;
  let newBody;

  query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const existingUser = await userDb.findOne(query);

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  if (password) {
    const hashedPassword = await hashPassword(password);

    newBody = {
      hash_password: hashedPassword,
      ...data,
    };
  } else {
    newBody = {
      ...data,
    };
  }

  const result = await userDb.update(newBody, query);

  if (result === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  return result;
};

// changeUserStatusById
const changeUserStatusById = async (id, status) => {
  const query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const isUserExists = await userDb.findOne(query);

  if (!isUserExists) {
    throw new Error("USER_NOT_FOUND");
  }

  if (isUserExists?.status === status) {
    throw new Error("USER_UPDATE_STATUS_FAILED");
  }

  const result = await userDb.update({ status: status }, query);

  if (result === 0) {
    throw new Error("USER_UPDATE_FAILED");
  }

  return result;
};

// removeUserById
const removeUserById = async (id) => {
  let query;

  query = {
    id: {
      [Op.eq]: `${id}`,
    },
  };

  const isExist = await userDb.findOne(query);

  if (!isExist) {
    throw new Error("USER_NOT_FOUND");
  }

  const result = await userDb.remove(query);

  query = {
    user_id: {
      [Op.eq]: `${id}`,
    },
  };
  await refreshTokenDb.remove(query);

  if (isExist?.role === "vendor") {
    query = {
      vendor_id: {
        [Op.eq]: `${id}`,
      },
    };
    await productDb.remove(query);
  }

  if (result === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  return result;
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  changeUserStatusById,
  removeUserById,
};
