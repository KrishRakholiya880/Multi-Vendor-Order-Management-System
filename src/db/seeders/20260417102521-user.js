"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Use bulkInsert and wrap the object in an array []
    return queryInterface.bulkInsert(
      "users",
      [
        {
          full_name: "Admin",
          email: "admin1@gmail.com",
          hash_password:
            "$2b$10$R/K/LD.DIq0kw9yahwq3p.0ePyIlWSmkotJgSvMQ7m0Xx1wcAlV5.",
          phone_number: "2398765432",
          status: "active",
          role: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          full_name: "Raj Patel",
          email: "rajpatel@gmail.com",
          hash_password:
            "$2b$10$R/K/LD.DIq0kw9yahwq3p.0ePyIlWSmkotJgSvMQ7m0Xx1wcAlV5.",
          phone_number: "2300765432",
          status: "active",
          role: "vendor",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          full_name: "Meet Patel",
          email: "meetpatel@gmail.com",
          hash_password:
            "$2b$10$R/K/LD.DIq0kw9yahwq3p.0ePyIlWSmkotJgSvMQ7m0Xx1wcAlV5.",
          phone_number: "2398763432",
          status: "active",
          role: "vendor",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          full_name: "Jeet Patel",
          email: "jeetpatel@gmail.com",
          hash_password:
            "$2b$10$R/K/LD.DIq0kw9yahwq3p.0ePyIlWSmkotJgSvMQ7m0Xx1wcAlV5.",
          phone_number: "2678763432",
          status: "inactive",
          role: "vendor",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    // Use bulkDelete. It's safer to delete by a specific field like email or ID
    return queryInterface.bulkDelete("users", {});
  },
};
