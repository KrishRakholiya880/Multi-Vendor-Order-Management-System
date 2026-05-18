const redis = require("redis");

const redisClient = redis.createClient();

redisClient.on("error", (err) => console.log("Redis client error: ", err));
redisClient
  .connect()
  .catch((err) => console.error("Could not connect to Redis:", err));

module.exports = redisClient;
