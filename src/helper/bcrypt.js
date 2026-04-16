const bcrypt = require("bcrypt");
const saltRounds = 10;

// Hash the password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Verify a password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
