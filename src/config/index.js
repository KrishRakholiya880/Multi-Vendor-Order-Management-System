const dotenfSafe = require("dotenv-safe");

dotenfSafe.config({
  path: ".env",
  sample: ".env.example",
  allowEmptyValues: true,
});

module.exports = {
  application: {
    PORT: process.env.PORT,
  },
  tokenKeys: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  },
};
