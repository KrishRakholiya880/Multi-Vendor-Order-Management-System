"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("users", ["role"]);
    await queryInterface.addIndex("users", ["status"]);

    await queryInterface.addIndex("products", ["name"]);
    await queryInterface.addIndex("products", ["vendor_id"]);
    await queryInterface.addIndex("products", ["category_id"]);
    await queryInterface.addIndex("products", ["status"]);

    await queryInterface.addIndex("orders", ["customer_id"]);
    await queryInterface.addIndex("orders", ["status"]);

    await queryInterface.addIndex("order_items", ["order_id"]);
    await queryInterface.addIndex("order_items", ["product_id"]);
    await queryInterface.addIndex("order_items", ["status"]);

    await queryInterface.addIndex("carts", ["customer_id"]);

    await queryInterface.addIndex("cart_items", ["cart_id"]);
    await queryInterface.addIndex("cart_items", ["product_id"]);

    await queryInterface.addIndex("refresh_tokens", ["user_id"]);
    await queryInterface.addIndex("refresh_tokens", ["token"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("users", "users_role");
    await queryInterface.removeIndex("users", "users_status");

    await queryInterface.removeIndex("products", "products_name");
    await queryInterface.removeIndex("products", "products_vendor_id");
    await queryInterface.removeIndex("products", "products_category_id");
    await queryInterface.removeIndex("products", "products_status");

    await queryInterface.removeIndex("orders", "orders_customer_id");
    await queryInterface.removeIndex("orders", "orders_status");

    await queryInterface.removeIndex("order_items", "order_items_order_id");
    await queryInterface.removeIndex("order_items", "order_items_product_id");
    await queryInterface.removeIndex("order_items", "order_items_status");

    await queryInterface.removeIndex("carts", "carts_customer_id");

    await queryInterface.removeIndex("cart_items", "cart_items_cart_id");
    await queryInterface.removeIndex("cart_items", "cart_items_product_id");

    await queryInterface.removeIndex(
      "refresh_tokens",
      "refresh_tokens_user_id",
    );
    await queryInterface.removeIndex("refresh_tokens", "refresh_tokens_token");
  },
};
