const { createLogger, format, transports } = require("winston");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      ({
        timestamp,
        level,
        message,
        url,
        method,
        user_id,
        requestId,
        attempts,
        error,
      }) => {
        return `[${requestId}] [${timestamp}] ${user_id ? `[user_id: ${user_id}]` : ""} [${level.toUpperCase()}] ${method ? `[${method}]` : ""} ${url ? `[PATH: ${url}]` : ""} ${attempts ? `[ATTEMPTS: ${attempts}]` : ""} ${message ? `${message}` : ""} ${error ? `${error}` : ""}`;
      },
    ),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "src/logs/error.log",
      level: "error",
    }),
    new transports.File({
      filename: "src/logs/combined.log",
      filter: (info) => {
        const method = info.method || "";
        const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
        return allowedMethods.includes(method);
      },
    }),
  ],
});

module.exports = { logger };
