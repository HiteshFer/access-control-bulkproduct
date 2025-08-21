const { Queue } = require("bullmq");
const redisConnection = require("./redis");

const QUEUE_NAME = "product-bulk-upload";
const productQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

module.exports = { productQueue, QUEUE_NAME };
