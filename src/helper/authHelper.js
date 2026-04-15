const jwt = require("jsonwebtoken");

const { tokenKeys } = require("../config");

const ACCESS_TOKEN_SECRET = tokenKeys?.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = tokenKeys?.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_SECRET = tokenKeys?.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = tokenKeys?.REFRESH_TOKEN_EXPIRY;

const generateAccessAndRefreshTokens = (data) => {
  try {
    const accessToken = jwt.sign(data, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign(data, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error?.message || error);
  }
};

module.exports = { generateAccessAndRefreshTokens };
