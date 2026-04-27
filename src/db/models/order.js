"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      order.hasMany(models.order_item, {
        foreignKey: "order_id",
        as: "order_items",
      });
    }
  }
  order.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      total_amount: {
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
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      cancelled_at: {
        type: DataTypes.DATE,
      },
      delivered_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      underscored: true,
      modelName: "order",
      tableName: "orders",
      createdAt: false,
      updatedAt: false,
    },
  );
  return order;
};
