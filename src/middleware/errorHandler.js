const errorCodes = require("../constant/errorCodes");

const errorHandler = async (err, req, res, next) => {
  const errorKey = Object.keys(errorCodes);
  const errMessage = err.message;
  const errorMatch = errorKey.includes(errMessage);

  if (errorMatch) {
    const status = errorCodes[errMessage].httpStatusCode;
    const code = errorCodes[errMessage].body.code;
    const message = errorCodes[errMessage].body.message;

    res.status(status).json({ code, message });
  } else {
    res.status(err.status || 500).json({
      code: err.code || "server_crashed",
      message: err.message || "server crashed!!!",
    });
  }
};

module.exports = errorHandler;
