import * as redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  // @ts-ignore
  tls: {
    rejectUnauthorized: false,
  },
  // socket: {
  //   tls: true,
  //   rejectUnauthorized: false,
  // },
});

global.isRedisReady = false;

redisClient.on('ready', () => {
  global.isRedisReady = true;
  console.log('redis is running');
});
redisClient.on('connect', () => {
  global.isRedisReady = true;
  console.info('Redis connected!');
});
redisClient.on('error', err => {
  global.isRedisReady = false;
  console.error('Redis Client Error', err);
});

redisClient.connect().then();
redisClient.flushAll().then();

export default redisClient;
