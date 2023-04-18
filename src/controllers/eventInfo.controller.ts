import { ALBUM, PRODUCT, versions } from '../constants';
import { eventInfoService } from '../services';
import { AmebloRequestHandler, EventInfo, UpdateEventInfoCacheRequestHandler } from '../types';

const getEventInfo: AmebloRequestHandler<typeof ALBUM> = async (req, res, next) => {
  try {
    const { urlId } = req.params;
    const { cache } = req.body;
    let statusCode = 200;
    let result: EventInfo<'album' | 'product'>;

    if (cache.eventInfo && cache.products) {
      result = cache.eventInfo;
    } else {
      const { errorMessage, saveCache, result: getEventInfoResult } = await eventInfoService.getEventInfo(urlId, cache);

      if (errorMessage) {
        throw Error(errorMessage);
      }

      if (saveCache) {
        statusCode = 201;
      }

      result = getEventInfoResult as EventInfo<'album' | 'product'>;
    }

    res.status(statusCode).json({
      versions,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const deleteEventInfoCache: AmebloRequestHandler<typeof ALBUM | typeof PRODUCT> = async (req, res, next) => {
  try {
    const { urlId } = req.params;
    const { cache } = req.body;
    const { success, errorMessage } = await eventInfoService.deleteEventInfoCache(urlId, cache);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(200).json({
      success,
      message: success ? 'Cache Deleted' : 'Cache is Not Existed',
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const updateEventInfoCache: UpdateEventInfoCacheRequestHandler = async (req, res, next) => {
  try {
    const {
      params: { urlId },
      query: { productType },
      body: { cache },
    } = req;

    const { errorMessage, ...result } = await eventInfoService.updateEventInfoProductTypeCache(urlId, cache, productType);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(201).json({
      versions,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

export default {
  getEventInfo,
  deleteEventInfoCache,
  updateEventInfoCache,
};
