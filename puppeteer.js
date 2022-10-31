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

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const title = await page.evaluate(
      () => document.getElementsByClassName("skinArticleTitle")[0].innerText
    );
    const splitedTitle = title.split(/ |　/g);
    const fansignTypeIndex = splitedTitle.findIndex(
      (el) => el.includes("!") || el.includes("！") || el.includes("サイン会")
    );
    const group = splitedTitle.slice(0, fansignTypeIndex).join(" ");
    const fansignType = splitedTitle[fansignTypeIndex];
    const rest = splitedTitle.slice(fansignTypeIndex + 1);

    const eventDate = rest.filter(
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
        .replace(/ |　|:|：/g, "")
    );

    const [prices, agencyFees] = await page.evaluate(() =>
      [...document.querySelectorAll('[style="color:#0000ff;"]')]
        .map((el) => el.innerText)
        .filter((text) => text.match(/[０-９]+円/g))
        .join("")
        .split("代行手数料")
        .map((text) =>
          text
            .match(/[０-９]+円/g)
            .map((price) =>
              price
                .replace("円", "")
                .replace(/[０-９]/g, (s) =>
                  String.fromCharCode(s.charCodeAt(0) - 0xfee0)
                )
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
      prices,
      agencyFees,
    };
  } catch (err) {
    throw Error(err);
  } finally {
    await browser.close();
  }
};

module.exports = { crawlFansignInfo };
