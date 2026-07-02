const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const { tokenKeys } = require("../config");

const ACCESS_TOKEN_SECRET = tokenKeys?.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = tokenKeys?.ACCESS_TOKEN_EXPIRY;

const generateAccessAndRefreshTokens = (data) => {
  try {
    const accessToken = jwt.sign(data, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = uuidv4();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error?.message || error);
  }
};

const decodeToken = (token) => {
  try {
    const decodedData = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decodedData;
  } catch (error) {
    return null;
  }
};

module.exports = { generateAccessAndRefreshTokens, decodeToken };
