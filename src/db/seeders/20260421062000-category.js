"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "categories",
      [
        {
          id: 1,
          name: "Confectionery",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: "Beverages",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: "ConfSnacks & Nutsectionery",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          name: "Bakery & Dairy",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("categories", {});
  },
};
