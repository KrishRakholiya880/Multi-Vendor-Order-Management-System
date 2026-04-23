"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("vendor_details", {
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
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable("vendor_details");
  },
};
