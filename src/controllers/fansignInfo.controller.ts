import { redisClient } from '../redis';
import { fansignInfoService } from '../services';
import { PuppeteerRequestHandler } from '../types';

const getFansignInfo: PuppeteerRequestHandler = async (req, res, next) => {
  try {
    const { url, redisKey, cache } = req.query;

    if (global.isRedisReady && cache) {
      res.status(200).json(cache);
    } else {
      const fansignInfo = await fansignInfoService.getFansignInfo(url);

      if (global.isRedisReady) {
        await redisClient.set(redisKey, JSON.stringify(fansignInfo));
        await redisClient.expire(redisKey, 7200);

        res.status(201);
      } else {
        res.status(200);
      }

      res.json(fansignInfo);
    }
  } catch (error) {
    console.error(error);
    res.status(400);
  }
};

const deleteFansignInfoCache: PuppeteerRequestHandler = async (req, res, next) => {
  try {
    const { cache, redisKey } = req.query;

    if (global.isRedisReady && cache) {
      await redisClient.del(redisKey);

      res.status(202).json({
        deleted: true,
        message: 'Cache Deleted',
      });
    } else {
      res.status(204).json({
        deleted: false,
        message: 'Cache is Not Existed',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json('failed');
  }
};

export default {
  getFansignInfo,
  deleteFansignInfoCache,
};
