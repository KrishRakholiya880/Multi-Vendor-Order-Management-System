"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("order_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price_at_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM([
          "placed",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled",
        ]),
        allowNull: false,
        defaultValue: "placed",
      },
      placed_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      shipped_at: {
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: null,
      },
      cancelled_at: {
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: null,
      },
      delivered_at: {
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: null,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable("order_items");
  },
};
