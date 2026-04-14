module.exports = {
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
};
