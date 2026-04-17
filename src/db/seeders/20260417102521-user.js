"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Use bulkInsert and wrap the object in an array []
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          full_name: "Raj Patel",
          email: "rajpatel@gmail.com",
          hash_password:
            "$2b$10$1UlyT8TB.SveVurF9uv/huMCYpGrKluOeNKV68EFZiCTZlKkS1jom",
          phone_number: "2345676543",
          is_active: true,
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
    return queryInterface.bulkDelete(
      "Users",
      { email: "rajpatel@gmail.com" },
      {},
    );
  },
};
