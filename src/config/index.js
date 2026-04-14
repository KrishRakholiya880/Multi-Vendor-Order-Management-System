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
};
