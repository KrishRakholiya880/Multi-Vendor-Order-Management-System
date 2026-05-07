const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const userDb = require("../../dbUtils/userDb");
const refreshTokenDb = require("../../dbUtils/refreshTokenDb");
const productDb = require("../../dbUtils/productDb");
const orderDb = require("../../dbUtils/orderDb");
const orderItemDb = require("../../dbUtils/orderItemDb");
const vendorDetailsDb = require("../../dbUtils/vendorDetailsDb");
const { product, user, vendor_detail } = require("../../db/models");
const { hashPassword } = require("../../helper/bcrypt");

// getUsers
const getUsers = async (role, status, sortBy = "desc", page, limit) => {
  const t = await sequelize.transaction();
  try {
    const query = {};

    if (role) query.role = { [Op.like]: `${role}` };
    if (status) query.status = { [Op.like]: `${status}` };

    const result = await userDb.findAll(query, sortBy, page, limit);

    if (!result) throw new Error("USER_NOT_FOUND");

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// getUserById
const getUserById = async (id) => {
  const t = await sequelize.transaction();

  try {
    const result = await userDb.findOne(
      { id: { [Op.eq]: `${id}` } },
      [
        { model: vendor_detail, as: "vendor_detail" },
        { model: product, as: "products" },
      ],
      t,
    );

    if (!result) throw new Error("USER_NOT_FOUND");

    if (result?.role !== "vendor") delete result?.vendor_detail;

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// createUser
const createUser = async (body) => {
  const t = await sequelize.transaction();

  try {
    const { email, password } = body;

    const isExists = await userDb.findOne(
      { email: { [Op.eq]: `${email}` } },
      [],
      t,
    );
    if (isExists) throw new Error("USER_EXISTS");

    const hashedPassword = await hashPassword(password);

    const result = await userDb.create(
      {
        ...body,
        hash_password: hashedPassword,
      },
      t,
    );
    if (!result) throw new Error("USER_NOT_FOUND");

    delete result.created_at;
    delete result.updated_at;
    delete result.hash_password;

    return result;
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// updateUserById
const updateUserById = async (data, id) => {
  const t = await sequelize.transaction();
  try {
    const { password } = data;

    const existingUser = await userDb.findOne(
      { id: { [Op.eq]: `${id}` } },
      [],
      t,
    );
    if (!existingUser) throw new Error("USER_NOT_FOUND");

    const newBody = password
      ? { ...data, hash_password: await hashPassword(password) }
      : { ...data };

    const result = await userDb.update(
      newBody,
      { id: { [Op.eq]: `${id}` } },
      t,
    );

    await t.commit();
    return result;
    return;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// changeUserStatusById
const changeUserStatusById = async (id, status) => {
  const t = await sequelize.transaction();
  try {
    const isUserExists = await userDb.findOne(
      { id: { [Op.eq]: `${id}` } },
      [],
      t,
    );
    if (!isUserExists) throw new Error("USER_NOT_FOUND");

    if (isUserExists?.status === status)
      throw new Error("USER_STATUS_ALREADY_SAME");

    if (isUserExists?.role === "vendor") {
      await vendorDetailsDb.update(
        { vendor_status: status },
        { user_id: { [Op.eq]: `${id}` } },
        t,
      );
    }
    const result = await userDb.update(
      { status },
      { id: { [Op.eq]: `${id}` } },
      t,
    );

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// removeUserById
const removeUserById = async (id) => {
  const t = await sequelize.transaction();

  try {
    const query = { id: { [Op.eq]: `${id}` } };

    const isExist = await userDb.findOne(query, [], t);
    if (!isExist) throw new Error("USER_NOT_FOUND");

    await refreshTokenDb.remove({ user_id: `${id}` }, t);

    if (isExist?.role === "vendor") {
      await productDb.remove({ vendor_id: `${id}` }, t);
      await vendorDetailsDb.remove({ user_id: `${id}` }, t);
    }

    const orderData = await orderDb.findOne(
      { customer_id: `${id}` },
      {},
      [],
      t,
    );
    if (orderData) {
      await orderItemDb.remove({ order_id: `${orderData?.id}` }, t);
      await orderDb.remove({ customer_id: `${id}` }, t);
    }

    const result = await userDb.remove(query, t);
    return result;
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
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
