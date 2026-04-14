const jwt = require("jsonwebtoken");

const { tokenKeys } = require("../config");

const ACCESS_TOKEN_SECRET = tokenKeys?.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = tokenKeys?.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_SECRET = tokenKeys?.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = tokenKeys?.REFRESH_TOKEN_EXPIRY;

const generateAccessAndRefreshTokens = (body) => {
  const accessToken = jwt.sign(body, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign(body, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

module.exports = { generateAccessAndRefreshTokens };
