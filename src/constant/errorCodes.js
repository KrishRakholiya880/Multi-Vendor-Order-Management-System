module.exports = {
  // Authentication
  TOKEN_REQUIRED: {
    httpStatusCode: 401,
    body: {
      code: "unauthorized",
      message: "Authentication is required to access this resource!!!",
    },
  },
  ACCESS_DENIED: {
    httpStatusCode: 403,
    body: {
      code: "forbidden",
      message:
        "You do not have the necessary permissions to perform this action!!!",
    },
  },
  ACCESS_TOKEN_REQUIRED: {
    httpStatusCode: 401,
    body: {
      code: "required",
      message: "Access token is missing from the request!!!",
    },
  },
  INVALID_ACCESS_TOKEN: {
    httpStatusCode: 401,
    body: {
      code: "invalid_token",
      message:
        "Your session has expired or the token is invalid. Please log in again!!!",
    },
  },
  REFRESH_TOKEN_REQUIRED: {
    httpStatusCode: 400,
    body: {
      code: "token_required",
      message:
        "A valid refresh token must be provided to renew your session!!!",
    },
  },
  INVALID_REFRESH_TOKEN: {
    httpStatusCode: 401,
    body: {
      code: "invalid_refresh_token",
      message:
        "The refresh token is invalid or has expired. Please sign in again!!!",
    },
  },
  USER_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "No user account was found with the provided credentials!!!",
    },
  },
  USER_EXISTS: {
    httpStatusCode: 409,
    body: {
      code: "duplicate_user",
      message: "An account with this email already exists!!!",
    },
  },
  INVALID_PASSWORD: {
    httpStatusCode: 401,
    body: {
      code: "unauthorized",
      message: "The password you entered is incorrect. Please try again!!!",
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
