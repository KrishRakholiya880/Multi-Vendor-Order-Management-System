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
      message:
        "This product is owned by other vendor, so you can't access it!!!",
    },
  },
  ACCESS_TOKEN_REQUIRED: {
    httpStatusCode: 401,
    body: {
      code: "required",
      message: "Access token is missing from the request!!!",
    },
  },
  SESSION_EXPIRED: {
    httpStatusCode: 401,
    body: {
      code: "session_expired",
      message: "Your session has expired. Please login again!!!",
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
  ACCOUNT_DEACTIVATED: {
    httpStatusCode: 403,
    body: {
      code: "account_deactivated",
      message:
        "Your account has been deactivated by admin. Please contact support!!!",
    },
  },
  USER_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "No user account was found!!!",
    },
  },
  USER_DATA_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "User data not found!!!",
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
  USER_CREATION_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "creation_failed",
      message: "Failed to add the user!!!",
    },
  },
  USER_UPDATE_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "update_failed",
      message: "Failed to update the user!!!",
    },
  },
  USER_STATUS_ALREADY_SAME: {
    httpStatusCode: 400,
    body: {
      code: "bad_request",
      message:
        "Status of user already same. You can't update status with same status!!!",
    },
  },
  USER_REMOVE_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "remove_failed",
      message: "Failed to remove the user!!!",
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
  ONLY_CUSTOMERS_ACCESS: {
    httpStatusCode: 401,
    body: {
      code: "unauthorized",
      message: "Only customers can perform this action!!!",
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
  PRODUCT_UNAVAILABLE: {
    httpStatusCode: 400,
    body: {
      code: "product_unavailable",
      message: "Product is unavailable or inactive!!!",
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

  // vendorDetails
  VENDOR_DETAILS_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "details_not_found",
      message: "Vendor's details not found!!!",
    },
  },
  USER_DETAILS_ALREADY_FILLED: {
    httpStatusCode: 400,
    body: {
      code: "details_aleady_exists",
      message: "Vendor's details already filled!!!",
    },
  },
  UNAUTHORIZED_VENDOR_ACTION: {
    httpStatusCode: 403,
    body: {
      code: "unauthorized",
      message:
        "You are not authorized to update or remove other vendor's details!!!",
    },
  },
  USER_IS_CUSTOMER: {
    httpStatusCode: 500,
    body: {
      code: "conflict",
      message: "User is customer. customer can't add vendor details!!!",
    },
  },

  // cart
  CART_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Cart data not found!!!",
    },
  },
  CART_ITEMS_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Cart items not found!!!",
    },
  },
  OUT_OF_STOCK: {
    httpStatusCode: 400,
    body: {
      code: "out_of_stock",
      message: "Product is out of stock!!!",
    },
  },
  INSUFFICIENT_STOCK: {
    httpStatusCode: 400,
    body: {
      code: "insufficient_stock",
      message: "Insufficient stock for the requested quantity!!!",
    },
  },
  CART_UPDATE_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "update_failed",
      message: "Failed to update the cart!!!",
    },
  },
  CART_PRODUCT_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Cart product not found!!!",
    },
  },
  CART_ITEM_REMOVE_FAILED: {
    httpStatusCode: 404,
    body: {
      code: "remove_failed",
      message: "Cart product remove failed!!!",
    },
  },

  // order
  ORDER_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Order not found!!!",
    },
  },
  ORDERS_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Order not found!!!",
    },
  },
  ORDER_ITEM_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Order item not found!!!",
    },
  },
  ORDER_ITEMS_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Order item not found!!!",
    },
  },
  ORDER_CREATION_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "server_error",
      message: "Order creation failed!!!",
    },
  },
  ORDER_ITEM_ALREADY_CANCELLED: {
    httpStatusCode: 400,
    body: {
      code: "already_cancelled",
      message: "Order item is already cancelled!!!",
    },
  },
  ORDER_ITEM_CREATION_FAILED: {
    httpStatusCode: 500,
    body: {
      code: "server_error",
      message: "Order item creation failed!!!",
    },
  },
  CHANGE_ORDER_STATUS_BY_WRONG_VENDOR: {
    httpStatusCode: 401,
    body: {
      code: "unauthorized",
      message: "You can't update order status of other vendors orders!!!",
    },
  },
  INVALID_STATUS_TRANSITION: {
    httpStatusCode: 400,
    body: {
      code: "invalid_status",
      message: "Invalid order status transition!!!",
    },
  },
  WRONG_VENDOR_ORDER_CANCEL: {
    httpStatusCode: 403,
    body: {
      code: "unauthorized",
      message: "You are not authorized to cancel another vendor's order!!!",
    },
  },

  // Analytics
  SALES_DATA_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Sales data not found!!!",
    },
  },
  PURCHASE_DATA_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Purchase data not found!!!",
    },
  },
  REVENUE_DATA_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Revenue data not found!!!",
    },
  },
  PERFORMANCE_DATA_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Product performance data not found!!!",
    },
  },

  // Others
  VENDOR_ID_REQUIRED: {
    httpStatusCode: 400,
    body: {
      code: "validation_error",
      message: "vendor_id is required for admin!!!",
    },
  },
  VENDOR_UNAVAILABLE: {
    httpStatusCode: 400,
    body: {
      code: "bad_request",
      message: "Vendor is currently unavailable!!!",
    },
  },
};
