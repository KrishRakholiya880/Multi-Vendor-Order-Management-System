const { Op } = require("sequelize");
const { sequelize } = require("../../db/models");
const userDb = require("../../dbUtils/userDb");
const refreshTokenDb = require("../../dbUtils/refreshTokenDb");
const productDb = require("../../dbUtils/productDb");
const cartDb = require("../../dbUtils/cartDb");
const cartItemDb = require("../../dbUtils/cartItemDb");
const orderDb = require("../../dbUtils/orderDb");
const orderItemDb = require("../../dbUtils/orderItemDb");
const vendorDetailsDb = require("../../dbUtils/vendorDetailsDb");
const { product, user, vendor_detail } = require("../../db/models");
const { hashPassword } = require("../../helper/bcrypt");
const { logger } = require("../../helper/logger");
const redisClient = require("../../helper/redis");

// getUsers
const getUsers = async (
  search,
  role,
  status,
  sortBy = "desc",
  from_date,
  to_date,
  page,
  limit,
) => {
  const t = await sequelize.transaction();
  try {
    const query = {};

    if (search) query.full_name = { [Op.like]: `%${search}%` };
    if (role) query.role = { [Op.like]: `${role}` };
    if (status) query.status = { [Op.like]: `${status}` };

    if (from_date && to_date) {
      const startDate = new Date(from_date);
      const endDate = new Date(to_date);
      endDate.setHours(23, 59, 59, 999);

      query.created_at = { [Op.between]: [startDate, endDate] };
    } else if (from_date) {
      query.created_at = { [Op.gte]: new Date(from_date) };
    } else if (to_date) {
      const endDate = new Date(to_date);
      endDate.setHours(23, 59, 59, 999);
      console.log(endDate);
      query.created_at = { [Op.lte]: endDate };
    }

    const result = await userDb.findAll(
      query,
      { exclude: ["hash_password"] },
      sortBy,
      page,
      limit,
      t,
    );

    if (!result) throw new Error("USERS_NOT_FOUND");

    delete result?.hash_password;

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
      {},
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
const createUser = async (body, reqUrlMet) => {
  const t = await sequelize.transaction();

  try {
    const { email, password } = body;

    const isExists = await userDb.findOne(
      { email: { [Op.eq]: `${email}` } },
      ["email"],
      [],
      t,
    );
    if (isExists) throw new Error("USER_EXISTS");

    const hashedPassword = await hashPassword(password);

    const result = await userDb.create(
      { ...body, hash_password: hashedPassword },
      t,
    );
    if (!result) throw new Error("USER_NOT_FOUND");

    logger.info("User created successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      role: result?.role,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Create user error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      error: error.message,
    });
    throw error;
  }
};

// updateUserById
const updateUserById = async (data, id, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const { password } = data;

    const existingUser = await userDb.findOne(
      { id: { [Op.eq]: `${id}` } },
      ["id"],
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

    logger.info("User updated successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Update user error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      error: error.message,
    });
    throw error;
  }
};

// changeUserStatusById
const changeUserStatusById = async (id, status, reqUrlMet) => {
  const t = await sequelize.transaction();
  try {
    const isUserExists = await userDb.findOne(
      { id: { [Op.eq]: `${id}` } },
      ["status", "role"],
      [],
      t,
    );
    if (!isUserExists) throw new Error("USER_NOT_FOUND");

    if (isUserExists?.status === status)
      throw new Error("USER_STATUS_ALREADY_SAME");

    if (isUserExists?.role === "vendor") {
      const vendorProducts = await productDb.findAll(
        { vendor_id: id },
        ["id", "name"],
        [],
        null,
        null,
        null,
        null,
        t,
      );

      if (!vendorProducts) throw new Error("PRODUCTS_NOT_FOUND");

      await vendorDetailsDb.update(
        { vendor_status: status },
        { user_id: { [Op.eq]: `${id}` } },
        t,
      );

      await productDb.update(
        {
          status: status,
        },
        { vendor_id: id },
        t,
      );

      await redisClient.INCREMENT_VERSION("vendorDetails:version");
    }
    const result = await userDb.update(
      { status },
      { id: { [Op.eq]: `${id}` } },
      t,
    );

    logger.info("User status updated successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Update user status error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      error: error.message,
    });
    throw error;
  }
};

// removeUserById
const removeUserById = async (id, reqUrlMet) => {
  const t = await sequelize.transaction();

  try {
    const isUserExist = await userDb.findOne(
      { id: { [Op.eq]: `${id}` } },
      ["role"],
      [],
      t,
    );
    if (!isUserExist) throw new Error("USER_NOT_FOUND");

    await refreshTokenDb.remove({ user_id: `${id}` }, t);

    if (isUserExist?.role === "vendor") {
      const vendorProducts = await productDb.findAll(
        { vendor_id: `${id}` },
        ["id"],
        [],
        null,
        null,
        null,
        null,
        t,
      );
      const productIds = vendorProducts.map((p) => p.id);

      if (productIds.length > 0) {
        const affectedCartData = await sequelize.query(
          `SELECT DISTINCT cart_id FROM cart_items WHERE product_id IN (:productIds)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { productIds },
            transaction: t,
          },
        );
        const cartIds = affectedCartData.map((c) => c.cart_id);

        const affectedOrderData = await sequelize.query(
          `SELECT DISTINCT order_id FROM order_items WHERE product_id IN (:productIds)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { productIds },
            transaction: t,
          },
        );
        const orderIds = affectedOrderData.map((o) => o.order_id);

        await cartItemDb.remove({ product_id: { [Op.in]: productIds } }, t);
        await orderItemDb.remove(
          {
            product_id: { [Op.in]: productIds },
            status: { [Op.notIn]: ["shipped", "delivered"] },
          },
          t,
        );

        if (cartIds.length > 0) {
          await cartDb.remove(
            {
              id: {
                [Op.in]: cartIds,
                [Op.notIn]: sequelize.literal(
                  `(SELECT DISTINCT cart_id FROM cart_items)`,
                ),
              },
            },
            t,
          );
          await sequelize.query(
            `UPDATE carts c SET total_amount = (SELECT SUM(quantity * unit_price) FROM cart_items WHERE cart_id = c.id) WHERE c.id IN (SELECT DISTINCT cart_id FROM cart_items) AND c.id IN (:cartIds)`,
            {
              transaction: t,
              replacements: { cartIds },
            },
          );
        }

        if (orderIds.length > 0) {
          await orderDb.remove(
            {
              id: {
                [Op.in]: orderIds,
                [Op.notIn]: sequelize.literal(
                  `(SELECT DISTINCT order_id FROM order_items)`,
                ),
              },
            },
            t,
          );
          await sequelize.query(
            `UPDATE orders o SET total_amount = (SELECT SUM(quantity * price_at_purchase) FROM order_items WHERE order_id = o.id) WHERE o.id IN (SELECT DISTINCT order_id FROM order_items) AND o.id IN (:orderIds)`,
            {
              transaction: t,
              replacements: { orderIds },
            },
          );
        }
      }

      await vendorDetailsDb.remove({ user_id: `${id}` }, t);
      await productDb.remove({ vendor_id: `${id}` }, t);

      await redisClient.INCREMENT_VERSION("vendorDetails:version");
      await redisClient.INCREMENT_VERSION("products:version");
    } else if (isUserExist?.role === "customer") {
      await orderItemDb.remove(
        {
          order_id: {
            [Op.in]: sequelize.literal(
              `(SELECT id FROM orders WHERE customer_id = ${id})`,
            ),
          },
        },
        t,
      );
      await orderDb.remove({ customer_id: `${id}` }, t);

      const cartData = await cartDb.findOne(
        { customer_id: `${id}` },
        ["id"],
        [],
        t,
      );
      if (cartData) {
        await cartItemDb.remove({ cart_id: `${cartData?.id}` }, t);
        await cartDb.remove({ customer_id: `${id}` }, t);
      }
    }

    const result = await userDb.remove({ id: { [Op.eq]: `${id}` } }, t);

    await redisClient.INCREMENT_VERSION("cart:version");
    await redisClient.INCREMENT_VERSION("orders:version");

    logger.info("User removed successfully", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Remove user error:", {
      url: reqUrlMet.url,
      method: reqUrlMet.method,
      requestId: reqUrlMet.requestId,
      error: error.message,
    });
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
