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
    await queryInterface.removeIndex("users", ["role"]);
    await queryInterface.removeIndex("users", ["status"]);

    await queryInterface.removeIndex("products", ["name"]);
    await queryInterface.removeIndex("products", ["vendor_id"]);
    await queryInterface.removeIndex("products", ["category_id"]);
    await queryInterface.removeIndex("products", ["status"]);

    await queryInterface.removeIndex("orders", ["customer_id"]);
    await queryInterface.removeIndex("orders", ["status"]);

    await queryInterface.removeIndex("order_items", ["order_id"]);
    await queryInterface.removeIndex("order_items", ["product_id"]);
    await queryInterface.removeIndex("order_items", ["status"]);

    await queryInterface.removeIndex("carts", ["customer_id"]);

    await queryInterface.removeIndex("cart_items", ["cart_id"]);
    await queryInterface.removeIndex("cart_items", ["product_id"]);

    await queryInterface.removeIndex("refresh_tokens", ["user_id"]);
    await queryInterface.removeIndex("refresh_tokens", ["token"]);
  },
};
