const dotenvSafe = require("dotenv-safe");

dotenvSafe.config({
  path: ".env",
  sample: ".env.example",
  allowEmptyValues: true,
});

module.exports = {
  application: {
    PORT: process.env.PORT,
  },
  db_config: {
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
  },
  expressSession: {
    HTTPONLY: process.env.HTTPONLY,
    SECURE: process.env.SECURE,
    MAX_AGE_ACCESS: process.env.MAX_AGE_ACCESS,
    MAX_AGE_REFRESH: process.env.MAX_AGE_REFRESH,
  },
  tokenKeys: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  },
};
