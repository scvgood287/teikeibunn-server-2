const express = require('express');
const cors = require('cors');
const { crawlFansignInfo } = require('./utils');
const { versions } = require('./constants');
const app = express();
const port = process.env.PORT || 443;

app.use(cors());

app.get('/api/checkVersion', async (req, res, next) => {
  try {
    res.send(versions);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.get('/api/fansign/info', async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url.includes('ameblo.jp/zoa959595')) {
      throw new Error('Invalid URL');
    }

    const fansignInfo = await crawlFansignInfo(url);

    res.send(fansignInfo);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.listen(port, () => console.log('server listening on port ' + port));
