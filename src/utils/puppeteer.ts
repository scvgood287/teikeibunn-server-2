import { launch, PuppeteerLaunchOptions, Browser, Page } from 'puppeteer';
import { trimAllForObject, fullNumberToHalfNumber, dateStringToDate, analyze } from './calculators';
import { eventInfoRegex, EVENT_INFOS, isProduction, crawlEventInfoResultDefault } from '../constants';
import { BrowserInstance, BrowserFunction, CrawlEventInfoResult, BaseCrawlEventInfoResult, DateInfo, EventDateInfos } from '../types';

export const defaultOptions: PuppeteerLaunchOptions = {
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'],
};
// isProduction
//   ? {
//       args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'],
//     }
//   : { headless: false };

export class BrowserInstances {
  static #browser: Browser;

  static async getInstance(puppeteerLaunchOptions: PuppeteerLaunchOptions = defaultOptions) {
    if (!BrowserInstances.#browser) {
      BrowserInstances.#browser = await launch(puppeteerLaunchOptions);
    }

    return BrowserInstances.#browser;
  }

  // static #browsers: BrowserInstance[];

  // static async getInstance(puppeteerLaunchOptions: PuppeteerLaunchOptions = defaultOptions) {
  //   let browserInstance = BrowserInstances.#browsers.find(({ states: { inUse } }) => !inUse);

  //   if (!browserInstance) {
  //     browserInstance = {
  //       id: BrowserInstances.#browsers.length,
  //       states: {
  //         inUse: false,
  //       },
  //       browser: await launch(puppeteerLaunchOptions),
  //     };

  //     BrowserInstances.#browsers.push(browserInstance);
  //   }

  //   return browserInstance;
  // }

  // static setInUse(id: number) {
  //   BrowserInstances.#browsers[id].states.inUse = true;
  // }

  // static setInUnuse(id: number) {
  //   BrowserInstances.#browsers[id].states.inUse = false;
  // }
}

export const useBrowserTransaction = <A, R>(transaction: BrowserFunction<A, R>, puppeteerLaunchOptions: PuppeteerLaunchOptions = defaultOptions) => {
  const browserTransaction = async (args: A) => {
    const browser = await BrowserInstances.getInstance(puppeteerLaunchOptions);

    // const { id, browser } = await BrowserInstances.getInstance(puppeteerLaunchOptions);
    // BrowserInstances.setInUse(id);

    let usedPages: Page[] = [];

    try {
      const { pages, ...result } = await transaction(browser, args);

      usedPages = pages;

      return result;
    } finally {
      await Promise.all(usedPages.map(async page => await page.close()));

      // BrowserInstances.setInUnuse(id);
    }
  };

  return browserTransaction;
};

export const crawlEventInfo = async (browser: Browser, url: string) => {
  const pages: Page[] = [];
  let baseResults: CrawlEventInfoResult = crawlEventInfoResultDefault;
  let title: string;
  let ps: string[];

  try {
    const page = await browser.newPage();
    pages.push(page);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    [title, ps] = (await page.evaluate(() => [
      ([...document.getElementsByClassName('skinArticleTitle')][0] as HTMLElement).innerText,
      [...document.getElementsByTagName('p')].map(p => p.innerText),
    ])) as [string, string[]];
  } catch (error) {
    return { pages, errorMessage: String(error) };
  }

  try {
    const ptexts = fullNumberToHalfNumber(ps.join(''));
    const splitedPs = ptexts.split(eventInfoRegex).filter(Boolean);

    baseResults = {
      ...baseResults,
      ...analyze({ title, ptexts }),
    };

    const { shop, eventEntryPeriod, ...dates } = Object.entries(EVENT_INFOS).reduce<{ [key: string]: string }>((texts, [info, infoText]) => {
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

    baseResults = {
      ...baseResults,
      shop,
    };

    const [eventEntryStartDate, eventDeadline] = eventEntryPeriod.split(/~|〜/g);

    dates.eventEntryStartDate = eventEntryStartDate;
    dates.eventDeadline = eventDeadline;

    baseResults = {
      ...baseResults,
      ...(Object.entries(dates).reduce<{ [key: string]: DateInfo }>((details, [info, dateString]) => {
        details[info] = dateStringToDate(dateString as string);

        return details;
      }, {}) as { [key in keyof (EventDateInfos & { eventEntryStartDate: DateInfo; eventDeadline: DateInfo })]: DateInfo }),
    };

    const [prices, agencyFees] = ptexts
      .split('代行手数料')
      .map(text => text.match(/([0-9]|\s)+円/g)?.map(price => Number(price.replace(/円|\s/g, ''))) || [0, 0]);

    baseResults = {
      ...baseResults,
      prices,
      agencyFees,
    };

    return {
      pages,
      result: trimAllForObject<CrawlEventInfoResult>(baseResults),
    };
  } catch (error) {
    return { pages, result: trimAllForObject<Partial<CrawlEventInfoResult>>(baseResults), errorMessage: String(error) };
  }
};

export const useCrawlEventInfo = useBrowserTransaction(crawlEventInfo);
