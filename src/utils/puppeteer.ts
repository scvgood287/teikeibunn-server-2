import { launch, PuppeteerLaunchOptions, Browser, Page } from 'puppeteer';
import { trimAllForObject, fullNumberToHalfNumber, dateStringToDate, analyze, oldAnalyze } from './calculators';
import { fansignInfoRegex, FANSIGN_INFOS, SPLIT_MARK, versions } from '../constants';
import { BrowserFunction } from '../types';
import dotenv from 'dotenv';

dotenv.config();

// export const browsers: Array<BrowserInstance> = [];

// export const getBrowserInstance = async (puppeteerLaunchOptions: PuppeteerLaunchOptions = defaultOptions): Promise<BrowserInstance> => {
//   let useableBrowserInstance = browsers.find(({ states: { inUse } }) => !inUse);

//   if (!useableBrowserInstance) {
//     useableBrowserInstance = {
//       id: browsers.length,
//       states: {
//         inUse: false,
//       },
//       browser: await launch(process.env.NODE_ENV !== 'production' ? { headless: false } : puppeteerLaunchOptions),
//     };

//     browsers.push(useableBrowserInstance);
//   }

//   return useableBrowserInstance;
// };

export const defaultOptions: PuppeteerLaunchOptions = {
  // headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'],
};

export class BrowserInstance {
  static #instance: Browser;

  static async getInstance(puppeteerLaunchOptions: PuppeteerLaunchOptions = defaultOptions) {
    if (!BrowserInstance.#instance) {
      BrowserInstance.#instance = await launch(puppeteerLaunchOptions);
    }

    return BrowserInstance.#instance;
  }
}

export const useBrowserTransaction = <A, R>(transaction: BrowserFunction<A, R>, puppeteerLaunchOptions: PuppeteerLaunchOptions = defaultOptions) => {
  const browserTransaction = async (args: A) => {
    const browser = await BrowserInstance.getInstance(puppeteerLaunchOptions);
    let usedPages: Page[] = [];

    try {
      const { pages, result } = await transaction(browser, args);

      usedPages = pages;
      return result;
    } catch (error) {
      throw Error(String(error));
    } finally {
      await Promise.all(usedPages.map(async page => await page.close()));
    }

    //   const { id, browser } = await getBrowserInstance(puppeteerLaunchOptions);
    //   browsers[id].states.inUse = true;

    //   try {
    //     return await transaction(browser, args);
    //   } catch (error) {
    //     throw Error(String(error));
    //   } finally {
    //     await Promise.all((await browser.pages()).map(async page => await page.close()));
    //     browsers[id].states.inUse = false;
    //   }
    // };
  };

  return browserTransaction;
};

export const crawlFansignInfo: BrowserFunction<string, Object> = async (browser: Browser, url: string) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const { title, ps }: { title: string; ps: string[] } = await page.evaluate(() => ({
    title: ([...document.getElementsByClassName('skinArticleTitle')][0] as HTMLElement).innerText,
    ps: [...document.getElementsByTagName('p')].map(p => p.innerText),
  }));
  const isNewTitle = title.includes(SPLIT_MARK);
  const ptexts = fullNumberToHalfNumber(ps.join(''));
  const splitedPs = ptexts.split(fansignInfoRegex).filter(Boolean);

  const [prices, agencyFees] = ptexts.split('代行手数料').map(text => text.match(/([0-9]|\s)+円/g)?.map(price => price.replace(/円|\s/g, '')) || [0, 0]);
  const { shop, eventEntryPeriod, ...dates } = Object.entries(FANSIGN_INFOS).reduce<any>((texts, [info, infoText]) => {
    const infoIndex = splitedPs.findIndex(innerText => innerText.includes(infoText)) + 1;
    texts[info] = !!infoIndex
      ? splitedPs[infoIndex]
          .trim()
          .split(/◆|場所/g)
          .filter(Boolean)[0]
          .split('👉')
          .filter(Boolean)[0]
          .replace(/:|：/g, '')
      : '';

    return texts;
  }, {});

  const [eventEntryStartDate, eventDeadline] = eventEntryPeriod.split(/~|〜/g);

  dates.eventEntryStartDate = eventEntryStartDate;
  dates.eventDeadline = eventDeadline;

  return {
    pages: [page],
    result: trimAllForObject({
      serverSideVersions: versions,
      isNewTitle,
      prices,
      agencyFees,
      shop,
      ...Object.entries(dates).reduce<any>((details, [info, dateString]) => {
        details[info] = dateStringToDate(dateString as string);

        return details;
      }, {}),
      ...(await (isNewTitle ? analyze : oldAnalyze)({ title, ptexts })),
    }),
  };
};

export const useCrawlFansignInfo = useBrowserTransaction(crawlFansignInfo);
