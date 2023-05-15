import { CacheTypes, EventInfo } from '../types';
import { cacheRepository } from '../repositories';
import { ALBUM, EVENT_INFO, PRODUCT } from '../constants';
import { getEventInfoOrProductsResult } from '../utils/db';

const getEventInfo = async (urlId: string, cache: CacheTypes) => await getEventInfoOrProductsResult(urlId, cache, EVENT_INFO);

const deleteEventInfoCache = async (urlId: string, cache: CacheTypes): Promise<{ success: boolean; errorMessage?: string }> => {
  try {
    const eventInfoCache = cache.eventInfo;
    let success = false;

    if (global.isRedisReady && eventInfoCache) {
      await cacheRepository.deleteCache(`${EVENT_INFO}/${urlId}`);

      success = true;
    }

    return {
      success,
    };
  } catch (error) {
    return { success: false, errorMessage: String(error) };
  }
};

const updateEventInfoProductTypeCache = async (urlId: string, cache: CacheTypes, productType: typeof ALBUM | typeof PRODUCT) => {
  const rollbacks = [];

  try {
    let success = false;

    if (global.isRedisReady && cache.eventInfo) {
      const newCache = { ...cache.eventInfo, productType };
      const redisKey = `${EVENT_INFO}/${urlId}`;

      rollbacks.unshift(async () => await cacheRepository.setCache(redisKey, JSON.stringify(cache.eventInfo)));

      await cacheRepository.setCache(redisKey, JSON.stringify(newCache));

      success = true;
    }

    return {
      success,
    };
  } catch (error) {
    for await (let rollback of rollbacks) {
      await rollback();
    }

    return { errorMessage: String(error) };
  }
};

export default {
  getEventInfo,
  deleteEventInfoCache,
  updateEventInfoProductTypeCache,
};
