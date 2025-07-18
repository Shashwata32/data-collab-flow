const { createPubSub } = require('@graphql-yoga/subscription');
const { createRedisEventTarget } = require('@graphql-yoga/redis-event-target');
const Redis = require('ioredis');

console.log(`[PubSub] Connecting to Redis with host: ${process.env.REDIS_HOST}`);

const redisOptions = {
  // Use the REDIS_HOST variable, defaulting to 'redis' for Docker
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
  retryStrategy: times => {
    return Math.min(times * 50, 2000);
  }
};

const pubsub = createPubSub({
  eventTarget: createRedisEventTarget({
    publishClient: new Redis(redisOptions),
    subscribeClient: new Redis(redisOptions),
  }),
});

module.exports = { pubsub };
