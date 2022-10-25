const puppeteer = require("puppeteer");

const crawlFansignInfo = async (url) => {
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--headless",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.goto(url);

    const text = await page.evaluate(
      () => document.getElementsByClassName("skinArticleTitle")[0].innerText
    );
    const [group, fansignType, ...splitedText] = text.split(" ");
    const eventDate = splitedText.filter(
      (word) =>
        word.includes("/") &&
        word.split("/").every((letter) => !isNaN(Number(letter)))
    )[0];
    const isMeet = fansignType.includes("対面");
    const isVideo = fansignType.includes("ビデオ");
    const isLuckyDraw = fansignType.includes("ラキドロ");
    const shop = await page.evaluate(() =>
      [...document.getElementsByTagName("p")]
        .filter((p) => p.innerText.includes("販売店"))[0]
        .innerText.split("販売店")[1]
        .replace(/ |　/g, "")
        .replace(":", "")
    );
    const [cdPrice, agencyFee] = await page.evaluate(() =>
      [...document.querySelectorAll('[style="font-weight:bold;"]')]
        .filter((el) => el.innerText.match(/[０-９]/g))
        .map((el) =>
          el.innerText
            .match(/[０-９]+/g)[0]
            .replace(/[０-９]/g, (s) =>
              String.fromCharCode(s.charCodeAt(0) - 0xfee0)
            )
        )
    );

    return {
      eventDate,
      group,
      fansignType: {
        isMeet,
        isVideo,
        isLuckyDraw,
      },
      shop,
      cdPrice,
      agencyFee,
    };
  } catch (err) {
    console.error(err);
    throw new Error(err);
  } finally {
    // await browser.close();
  }
};

module.exports = { crawlFansignInfo };

// 이벤트 날짜, 그룹, 대면인지 영통인지 럭키드로인지, 샵, cd가격, 대행수수료
