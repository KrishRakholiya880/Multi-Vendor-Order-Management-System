"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class vendor_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      vendor_detail.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user_data",
      });
    }
  }
  vendor_detail.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      company_phone_number: {
        type: DataTypes.STRING,
        unique: true,
      },
      company_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vendor_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      deleted_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "vendor_detail",
      tableName: "vendor_details",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
    },
  );
  return vendor_detail;
};
