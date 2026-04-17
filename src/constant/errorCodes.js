module.exports = {
  // Authentication
  USER_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "user not found!!!",
    },
  },
  USER_EXISTS: {
    httpStatusCode: 400,
    body: {
      code: "duplicate",
      message: "user already exists!!!",
    },
  },
  WRONG_PASSWORD: {
    httpStatusCode: 400,
    body: {
      code: "bad request",
      message: "wrong password!!!",
    },
  },
  REFRESH_TOKEN_REQUIRED: {
    httpStatusCode: 404,
    body: {
      code: "not found",
      message: "Refresh token not provided!!!",
    },
  },
  INVALID_REFRESH_TOKEN: {
    httpStatusCode: 401,
    body: {
      code: "invalid",
      message: "Refresh token was invalid or expired!!!",
    },
  },

  // Products
  PRODUCTS_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "products not found!!!",
    },
  },
  PRODUCT_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "product not found!!!",
    },
  },
};
