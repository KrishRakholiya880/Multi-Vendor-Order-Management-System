const { createLogger, format, transports } = require("winston");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const attemptTracker = {};

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const uuid = uuidv4();

      if (meta.email) {
        if (!attemptTracker[meta.email]) {
          attemptTracker[meta.email] = 0;
        }
        attemptTracker[meta.email]++;

        const { url, method, ...restMeta } = meta;
        return `[${uuid}] [${timestamp}] [${level.toUpperCase()}] ${method ? `[${method}]` : "[GET]"} [PATH: ${url || ""}] [ATTEMPTS: ${attemptTracker[meta.email]}] ${message} ${
          Object.keys(restMeta).length ? JSON.stringify(restMeta) : ""
        }`;
      }

      const { url, method, ...restMeta } = meta;
      return `[${uuid}] [${timestamp}] [${level.toUpperCase()}] ${method ? `[${method}]` : "[GET]"} [PATH: ${url || ""}] ${message} ${
        Object.keys(restMeta).length ? JSON.stringify(restMeta) : ""
      }`;
    }),
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
        // only log POST, PUT, DELETE, PATCH (write operations)
        const allowedMethods = ["POST", "PUT", "DELETE", "PATCH"];
        return allowedMethods.includes(method);
      },
    }),
  ],
});

module.exports = { logger, attemptTracker };
