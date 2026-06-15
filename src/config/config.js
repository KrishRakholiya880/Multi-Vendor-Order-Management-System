const { db_config } = require("./index");

module.exports = {
  development: {
    ...db_config,
    dialect: "mysql",
    logging: false,
  },
  test: {
    ...db_config,
    dialect: "mysql",
  },
  production: {
    ...db_config,
    dialect: "mysql",
  },
};
