"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Use bulkInsert and wrap the object in an array []
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          full_name: "Admin",
          email: "admin1@gmail.com",
          hash_password:
            "$2b$10$xJU550Im8Va76FlKTTrkMun8oFX3mVBbuu28x0rIXWM4k4WneQxOG",
          phone_number: "2398765432",
          is_active: true,
          role: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    // Use bulkDelete. It's safer to delete by a specific field like email or ID
    return queryInterface.bulkDelete("Users", {});
  },
};
