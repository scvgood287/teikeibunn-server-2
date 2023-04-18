import { Product } from '../entities';
import { versions } from '../constants';
import { productsService } from '../services';
import { UpdateProductsRequestHandler, CreateProductsRequestHandler, RemoveProductsRequestHandler, CacheRequestHandler } from '../types';

const getProducts: CacheRequestHandler = async (req, res, next) => {
  try {
    const {
      params: { urlId },
      body: { cache },
    } = req;
    let statusCode = 200;
    let result: {
      products: Product[];
    };

    if (cache.products && cache.eventInfo) {
      result = cache.products;
    } else {
      const { errorMessage, saveCache, result: getProductsResult } = await productsService.getProducts(urlId, cache);

      if (errorMessage) {
        throw Error(errorMessage);
      }

      if (saveCache) {
        statusCode = 201;
      }

      result = getProductsResult as {
        products: Product[];
      };
    }

    res.status(statusCode).json({ versions, result });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const createProducts: CreateProductsRequestHandler = async (req, res, next) => {
  try {
    const {
      body,
      params: { urlId },
    } = req;

    const { errorMessage, ...result } = await productsService.createProducts(urlId, body);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(201).json({ versions, result });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const removeProducts: RemoveProductsRequestHandler = async (req, res, next) => {
  try {
    const {
      params: { productIds },
    } = req;

    const { errorMessage, ...result } = await productsService.removeProducts(productIds);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(200).json({ versions, result });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const updateProducts: UpdateProductsRequestHandler = async (req, res, next) => {
  try {
    const { body } = req;

    const { errorMessage, ...result } = await productsService.updateProducts(body);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(200).json({ versions, result });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const updateProductsCache: CacheRequestHandler = async (req, res, next) => {
  try {
    const {
      params: { urlId },
      body: { cache },
    } = req;

    const { errorMessage, ...result } = await productsService.updateProductsCache(urlId, cache);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(200).json({ versions, result });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

export default {
  getProducts,
  createProducts,
  removeProducts,
  updateProducts,
  updateProductsCache,
};
