const redisClient = require("../lib/redis");

const GET = async (key) => {
  const val = await redisClient.get(key);
  return val ? JSON.parse(val) : null;
};

const SET = async (key, value, seconds) => {
  return await redisClient.set(key, JSON.stringify(value), { EX: seconds });
};

// const DESTROY = async (prefix) => {
//   let cursor = "0";
//   const pattern = `${prefix}:*`;
//   try {
//     do {
//       const reply = await redisClient.scan(cursor, {
//         MATCH: pattern,
//         COUNT: 100,
//       });
//       cursor = reply.cursor;
//       if (reply.keys?.length > 0) {
//         await redisClient.unlink(reply.keys);
//       }
//     } while (cursor !== "0");
//   } catch (err) {
//     console.error("Error during deleteFolder operation:", err);
//     throw err;
//   }
// };

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

module.exports = { GET, SET, GET_VERSION, INCREMENT_VERSION };
