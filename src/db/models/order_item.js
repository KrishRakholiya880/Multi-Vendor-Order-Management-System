"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class order_item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      order_item.belongsTo(models.order, {
        foreignKey: "order_id",
        as: "order",
      });

      order_item.belongsTo(models.product, {
        foreignKey: "product_id",
        as: "product_info",
      });
    }
  }
  order_item.init(
    {
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
        defaultValue: 1,
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
    },
    {
      sequelize,
      underscored: true,
      modelName: "order_item",
      tableName: "order_items",
      createdAt: "placed_at",
      updatedAt: false,
      deletedAt: "cancelled_at",
      paranoid: false,
    },
  );
  return order_item;
};
