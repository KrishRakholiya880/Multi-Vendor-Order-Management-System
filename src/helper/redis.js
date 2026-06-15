const redisClient = require("../lib/redis");

const GET = async (key) => {
  const val = await redisClient.get(key);
  return val ? JSON.parse(val) : null;
};

const SET = async (key, value, seconds) => {
  return await redisClient.set(key, JSON.stringify(value), { EX: seconds });
};

const GET_VERSION = async (versionKey) => {
  const v = await redisClient.get(versionKey);
  if (!v) {
    await redisClient.set(versionKey, "1");
    return "v1";
  }
  return `v${v}`;
};

const INCREMENT_VERSION = async (versionKey) => {
  return await redisClient.incr(versionKey);
};

const INCR_WITH_EXPIRY = async (key, expiry) => {
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.expire(key, expiry);
  }
  return count;
};

const DELETE = async (key) => {
  return await redisClient.del(key);
};

module.exports = {
  GET,
  SET,
  GET_VERSION,
  INCREMENT_VERSION,
  INCR_WITH_EXPIRY,
  DELETE,
};
