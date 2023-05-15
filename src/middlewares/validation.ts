import { cacheRepository } from '../repositories';
import { CacheRequestHandler, EventInfo } from '../types';
import { ALBUM, EVENT_INFO, PRODUCT, versions } from '../constants';
import { Product } from '../entities';

const validateCache: CacheRequestHandler = async (req, res, next) => {
  try {
    const { urlId } = req.params;
    let eventInfo: EventInfo<typeof ALBUM | typeof PRODUCT> | null = null;
    let products: { products: Product[] } | null = null;

    if (global.isRedisReady) {
      const eventInfoCache = await cacheRepository.getCache(`${EVENT_INFO}/${urlId}`);
      const productsCache = await cacheRepository.getCache(`${PRODUCT}/${urlId}`);

      if (eventInfoCache) {
        eventInfo = JSON.parse(eventInfoCache);
      }

      if (productsCache) {
        products = JSON.parse(productsCache);
      }
    }

    req.body.cache = {
      eventInfo,
      products,
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(400).json(String(error));
  }
};

const useEventInfoCache: CacheRequestHandler = async (req, res, next) => {
  const {
    cache: { eventInfo },
  } = req.body;

  if (eventInfo) {
    res.status(200).json({ versions, result: eventInfo });
  } else {
    next();
  }
};

const useProductsCache: CacheRequestHandler = async (req, res, next) => {
  const {
    cache: { products },
  } = req.body;

  if (products) {
    res.status(200).json({ versions, result: products });
  } else {
    next();
  }
};

export default {
  validateCache,
  useEventInfoCache,
  useProductsCache,
};
