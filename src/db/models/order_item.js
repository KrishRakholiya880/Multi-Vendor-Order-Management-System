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
        allowNull: 1,
      },
      price_at_purchase: {
        type: DataTypes.INTEGER,
        allowNull: false,
        allowNull: 1,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      underscored: true,
      modelName: "order_item",
      tableName: "order_items",
      createdAt: false,
      updatedAt: false,
    },
  );
  return order_item;
};
