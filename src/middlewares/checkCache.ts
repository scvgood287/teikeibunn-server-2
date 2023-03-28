import { redisClient } from '../redis';
import { PuppeteerRequestHandler } from '../types';

const checkAmebloCache: PuppeteerRequestHandler = async (req, res, next) => {
  try {
    const { url } = req.query;

    const splitedUrl = url.split(/(ameblo.jp\/zoa959595\/entry-|.html)/g);
    const preIndex = splitedUrl.indexOf('ameblo.jp/zoa959595/entry-');
    const postIndex = splitedUrl.indexOf('.html');

    if (preIndex === -1 || postIndex === -1) {
      throw new Error('Invalid URL');
    }

    const urlId = splitedUrl[(preIndex + postIndex) / 2];
    const redisKey = `crawlAmeblo/${urlId}`;

    req.query.redisKey = redisKey;

    if (global.isRedisReady) {
      const data = await redisClient.get(redisKey);

      req.query.cache = data ? JSON.parse(data) : data;
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(400).json('failed');
  }
};

export default {
  checkAmebloCache,
};
