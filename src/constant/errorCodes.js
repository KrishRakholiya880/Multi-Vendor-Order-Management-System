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
  ACCESS_DENIED_FOR_PRODUCT: {
    httpStatusCode: 403,
    body: {
      code: "forbidden",
      message: "You can't update/delete other vendor's products!!!",
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
      message: "No user account was found!!!",
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
  ONLY_ADMIN_ACCESS: {
    httpStatusCode: 401,
    body: {
      code: "unauthorized",
      message: "Only admins can perform this action!!!",
    },
  },
  ONLY_VENDOR_ACCESS: {
    httpStatusCode: 401,
    body: {
      code: "unauthorized",
      message: "Only vendors can perform this action!!!",
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
  PRODUCT_EXISTS: {
    httpStatusCode: 409,
    body: {
      code: "duplicate_product",
      message: "product already exists!!!",
    },
  },
  PRODUCT_CREATION_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "creation_failed",
      message: "Failed to add the product!!!",
    },
  },
  PRODUCT_UPDATE_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "update_failed",
      message: "Failed to update the product!!!",
    },
  },
  PRODUCT_UPDATE_STATUS_FAILED: {
    httpStatusCode: 400,
    body: {
      code: "update_failed",
      message:
        "Status of Product already same. You can't update status with same status!!!",
    },
  },
  PRODUCT_REMOVE_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "remove_failed",
      message: "Failed to remove the product!!!",
    },
  },

  // Categories
  CATEGORIES_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Categories not found!!!",
    },
  },
  CATEGORY_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Category not found!!!",
    },
  },
  CATEGORY_EXISTS: {
    httpStatusCode: 409,
    body: {
      code: "duplicate_category",
      message: "category already exists!!!",
    },
  },
  CATEGORY_CREATION_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "creation_failed",
      message: "Failed to add the category!!!",
    },
  },
  CATEGORY_UPDATE_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "update_failed",
      message: "Failed to update the category!!!",
    },
  },
  CATEGORY_REMOVE_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "remove_failed",
      message: "Failed to remove the category!!!",
    },
  },
};
