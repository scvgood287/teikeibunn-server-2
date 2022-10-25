const express = require("express");
const { crawlFansignInfo } = require("./puppeteer");
const app = express();
const port = process.env.PORT || 443;

app.get("/api/fansign/info", async (req, res, next) => {
  try {
    const { url } = req.query;
    const fansignInfo = await crawlFansignInfo(url);
    res.send(fansignInfo);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.listen(port, () => console.log("server listening on port " + port));
