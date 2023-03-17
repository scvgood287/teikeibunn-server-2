require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { crawlFansignInfo, imitateHTML } = require('./utils');
const { versions } = require('./constants');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 443;

const redisClient = redis.createClient({ url: process.env.REDIS_TLS_URL || process.env.REDIS_URL });

let redisIsReady = false;

redisClient.on('ready', () => {
  redisIsReady = true;
  console.log('redis is running');
});
redisClient.on('connect', () => {
  redisIsReady = true;
  console.info('Redis connected!');
});
redisClient.on('error', err => {
  redisIsReady = false;
  console.error('Redis Client Error', err);
});
redisClient.connect().then();
redisClient.flushAll().then();

app.use(cors());

app.get('/api/checkVersion', async (req, res, next) => {
  try {
    res.send(versions);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

const checkAmebloCache = async (req, res, next) => {
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

    if (redisIsReady) {
      const data = await redisClient.get(redisKey);

      req.query.cache = JSON.parse(data);
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(400);
  }
};

app.get('/api/fansign/info', checkAmebloCache, async (req, res, next) => {
  try {
    const { url, redisKey, cache } = req.query;

    if (redisIsReady && cache) {
      res.status(200);
      res.send(cache);
    } else {
      const fansignInfo = await crawlFansignInfo(url);

      if (redisIsReady) {
        await redisClient.set(redisKey, JSON.stringify(fansignInfo));
        await redisClient.expire(redisKey, 7200);
      }

      res.status(201);
      res.send(fansignInfo);
    }
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.delete('/api/amebloCache', checkAmebloCache, async (req, res, next) => {
  try {
    const { redisKey, cache } = req.query;

    if (redisIsReady && cache) {
      await redisClient.del(redisKey);

      res.status(202);
      res.send('Cache Deleted');
    } else {
      res.status(204);
    }
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.get('/api/imitateHTML', async (req, res, next) => {
  try {
    const { url } = req.query;

    const HTML = await imitateHTML(url);

    res.send(HTML);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => console.log('server listening on port ' + port));
