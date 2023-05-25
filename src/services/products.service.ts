import { optionRepository, productRepository } from '../repositories';
import { CacheTypes, ProductType } from '../types';
import { Product } from '../entities';
import { PRODUCT } from '../constants';
import { getEventInfoOrProductsResult } from '../utils/db';

const getProducts = async (urlId: string, cache: CacheTypes) => await getEventInfoOrProductsResult(urlId, cache, PRODUCT);

const createProducts = async (urlId: string, products: Array<ProductType>) => {
  try {
    const isAlreadyCreated = ((await productRepository.getProducts(urlId))?.length || 0) > 0;

    if (isAlreadyCreated) {
      return {
        createdProducts: [],
      };
    } else {
      return {
        createdProducts: await productRepository.saveProducts(
          await Promise.all(
            products.map(async ({ options, ...productType }) => {
              const product = productRepository.createProducts([{ ...productType, urlId }])[0];
              product.options = await optionRepository.saveOptions(optionRepository.createOptions(options));

              return product;
            }),
          ),
        ),
      };
    }
  } catch (error) {
    return {
      errorMessage: String(error),
    };
  }
};

const removeProducts = async (productIds: string) => {
  try {
    return {
      ...(await productRepository.removeProducts(productIds)),
    };
  } catch (error) {
    return {
      errorMessage: String(error),
    };
  }
};

const updateProducts = async (products: Array<Product>) => {
  try {
    return {
      ...(await productRepository.updateProducts(products)),
    };
  } catch (error) {
    return {
      errorMessage: String(error),
    };
  }
};

const updateProductsCache = async (urlId: string, cache: CacheTypes) => {
  cache.products = {
    products: await productRepository.getProducts(urlId),
  };

  return await getEventInfoOrProductsResult(urlId, cache, PRODUCT);
};

export default {
  getProducts,
  createProducts,
  removeProducts,
  updateProducts,
  updateProductsCache,
};
