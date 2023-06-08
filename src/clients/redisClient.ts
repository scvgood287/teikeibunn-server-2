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

redisClient.once('ready', () => {
  console.info('redis is running');
});
redisClient.once('connect', () => {
  console.info('Redis connected!');
});

redisClient.on('ready', () => {
  global.isRedisReady = true;
});
redisClient.on('connect', () => {
  global.isRedisReady = true;
});

redisClient.on('error', () => {
  global.isRedisReady = false;
});

export default redisClient;
