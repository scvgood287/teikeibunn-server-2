import { launch, PuppeteerLaunchOptions, Browser, Page } from 'puppeteer';
import { trimAllForObject, dateStringToDateInfo, analyze, initializeAmebloText } from './calculators';
import { eventInfoRegex, EVENT_INFOS, isProduction, crawlEventInfoResultDefault, dateInfoDefault, SPLIT_MARK } from '../constants';
import { BrowserInstance, BrowserFunction, CrawlEventInfoResult, DateInfo, EventInfos, ValueOf } from '../types';

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
  let ps: string[];

  try {
    const page = await browser.newPage();
    pages.push(page);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    ps = await page.evaluate(() => [...document.getElementsByTagName('p')].map(p => p.innerText));
  } catch (error) {
    return { pages, errorMessage: String(error) };
  }

  try {
    const ptext = ps.join('');
    const [subTitle, ...mains] = initializeAmebloText(ptext).split(eventInfoRegex).filter(Boolean);

    if (subTitle && mains && mains.length) {
      const splitedSubTitle = subTitle.split(new RegExp(`(\\${SPLIT_MARK})`)).filter(Boolean);
      const firstSplitMarkIndex = splitedSubTitle.indexOf(SPLIT_MARK);
      const secondSplitMarkIndex = splitedSubTitle.indexOf(SPLIT_MARK, firstSplitMarkIndex + 1);

      if (firstSplitMarkIndex !== -1 && secondSplitMarkIndex !== -1) {
        const group = splitedSubTitle[firstSplitMarkIndex + 1];

        baseResults = {
          ...baseResults,
          group,
          ...analyze(splitedSubTitle[secondSplitMarkIndex + 1]),
        };

        const { earlyEnd, place, shop, winnersNumber, eventEntryPeriod, ...dates } = (
          Object.entries(EVENT_INFOS) as [keyof EventInfos, ValueOf<EventInfos>][]
        ).reduce<{
          [key in keyof EventInfos | 'eventEntryStartDate' | 'eventDeadline']: string;
        }>(
          (texts, [info, infoText]) => ({
            ...texts,
            [info]: mains[mains.findIndex(innerText => innerText.includes(infoText)) + 1 || -1]?.replace(/\:|◆/g, '').replace(/👉/g, '\n').trim() || '',
          }),
          {
            earlyEnd: '',
            shop: '',
            place: '',
            winnersNumber: '',
            eventEntryPeriod: '',
            eventDate: '',
            depositDeadline: '',
            winnerAnnouncement: '',
            eventEntryStartDate: '',
            eventDeadline: '',
          },
        );

        baseResults = {
          ...baseResults,
          earlyEnd,
          place,
          shop,
          winnersNumber,
        };

        const [eventEntryStartDate, eventDeadline] = eventEntryPeriod.split(/~/g);

        dates.eventEntryStartDate = eventEntryStartDate;
        dates.eventDeadline = eventDeadline;

        baseResults = {
          ...baseResults,
          ...(Object.entries(dates) as [keyof typeof dates, string][]).reduce<{ [key in keyof typeof dates]: DateInfo }>(
            (details, [info, dateString]) => ({
              ...details,
              [info]: dateStringToDateInfo(dateString.replace(/\s/g, '').match(/-?\d.*/)?.[0] || ''),
            }),
            {
              eventDate: dateInfoDefault,
              depositDeadline: dateInfoDefault,
              winnerAnnouncement: dateInfoDefault,
              eventEntryStartDate: dateInfoDefault,
              eventDeadline: dateInfoDefault,
            },
          ),
        };

        const specialGoodsTexts = ptext.split(/(👉[^👉特典:]*特典\s*:\s*)/).filter(Boolean);
        const [prices, agencyFees] = mains[mains.length - 1]
          .split('代行手数料')
          .map(text => text.match(/([0-9]|\s)+円/g)?.map(price => Number(price.replace(/円|\s/g, ''))) || [0, 0]);

        specialGoodsTexts[specialGoodsTexts.length - 1] = initializeAmebloText(specialGoodsTexts[specialGoodsTexts.length - 1]).split(
          new RegExp(`\\s{2,}[^\\s]+\\s*:\\s*${prices[0]}円`),
        )[0];

        baseResults = {
          ...baseResults,
          prices,
          agencyFees,
          specialGoods: specialGoodsTexts
            .slice(specialGoodsTexts.findIndex(specialGoodsText => specialGoodsText.match(/^👉[^👉特典:]*特典\s*:\s*$/)))
            .reduce<Array<[string, string]>>((acc, curr) => {
              const specialGoodsText = curr.match(/[^👉特典:]*特典/)?.[0];

              if (specialGoodsText) {
                acc[acc.length] = [initializeAmebloText(specialGoodsText), ''];
              } else {
                acc[acc.length - 1][1] += [initializeAmebloText(curr).replace(/\s{2,}/g, ' / ')];
              }

              return acc;
            }, [])
            .reduce<{ [key: string]: string }>((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        };
      }
    }

    return {
      pages,
      result: trimAllForObject<CrawlEventInfoResult>(baseResults),
    };
  } catch (error) {
    return { pages, result: trimAllForObject<Partial<CrawlEventInfoResult>>(baseResults), errorMessage: String(error) };
  }
};

export const useCrawlEventInfo = useBrowserTransaction(crawlEventInfo);
