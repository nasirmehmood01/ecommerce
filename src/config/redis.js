require("dotenv").config();
const { createCluster } = require("redis");

const redisClient = createCluster({
  rootNodes: [
    {
      url: `rediss://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`,
    },
  ],
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redisClient;
