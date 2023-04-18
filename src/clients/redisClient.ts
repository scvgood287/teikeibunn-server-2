import * as redis from 'redis';
import { isProduction } from '../constants';
import dotenv from 'dotenv';

dotenv.config();

global.isRedisReady = false;

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  // @ts-ignore
  ...(isProduction
    ? {
        tls: {
          rejectUnauthorized: false,
        },
      }
    : {}),
});

redisClient.on('ready', () => {
  global.isRedisReady = true;
  console.info('redis is running');
});
redisClient.on('connect', () => {
  global.isRedisReady = true;
  console.info('Redis connected!');
});
redisClient.on('error', err => {
  global.isRedisReady = false;

  console.error('Redis Client Error', err);
});

export default redisClient;
