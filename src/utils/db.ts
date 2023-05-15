import { cacheRepository, productRepository } from '../repositories';
import { ALBUM, EVENT_INFO, PRODUCT } from '../constants';
import { Product } from '../entities';
import { CacheTypes, CrawlEventInfoResult, GetEventInfoAndProductsResult } from '../types';
import { amebloUrlIdToUrl, calculateDateDiff } from './calculators';
import { useCrawlEventInfo } from './puppeteer';

export const getEventInfoOrProductsResult = async <T extends keyof GetEventInfoAndProductsResult>(
  urlId: string,
  cache: CacheTypes,
  type: T,
): Promise<GetEventInfoAndProductsResult[T]> => {
  const crawlResult = cache.eventInfo ? { result: cache.eventInfo.eventInfo } : await useCrawlEventInfo(amebloUrlIdToUrl(urlId));
  const products = cache.products?.products || (await productRepository.getProducts(urlId));

  return crawlResult.errorMessage
    ? { saveCache: false, errorMessage: crawlResult.errorMessage, result: {} }
    : (await setEventInfoAndProductsCache(urlId, crawlResult.result as Partial<CrawlEventInfoResult>, products))[type];
};

export const setEventInfoAndProductsCache = async (
  urlId: string,
  eventInfo: Partial<CrawlEventInfoResult>,
  products: Product[],
): Promise<GetEventInfoAndProductsResult> => {
  const results: GetEventInfoAndProductsResult = {
    eventInfo: {
      result: {
        eventInfo,
        productType: products.length ? PRODUCT : ALBUM,
      },
      saveCache: false,
      errorMessage: '',
    },
    product: {
      result: { products },
      saveCache: false,
      errorMessage: '',
    },
  };

  if (typeof eventInfo.eventDeadline !== 'undefined') {
    const { year, month, day, hour, minutes } = eventInfo.eventDeadline;
    const dateDiffOfSeconds = Math.ceil(calculateDateDiff(new Date(), new Date(year, month - 1, day, hour, minutes)));
    const maxAge = 60 * 60 * 2 + (dateDiffOfSeconds > 0 ? dateDiffOfSeconds : 0);

    if (global.isRedisReady) {
      const targets: (keyof typeof results)[] = [EVENT_INFO, PRODUCT];

      for await (let target of targets) {
        const rollbacks = [];

        try {
          const key = `${target}/${urlId}`;

          rollbacks.unshift(async () => {
            await cacheRepository.deleteCache(key);
            results[target].saveCache = false;
          });

          await cacheRepository.setCache(key, JSON.stringify(results[target].result));
          await cacheRepository.expire(key, maxAge);

          results[target].saveCache = true;
        } catch (error) {
          for await (let rollback of rollbacks) {
            await rollback();
          }
        }
      }
    }
  }

  return results;
};
