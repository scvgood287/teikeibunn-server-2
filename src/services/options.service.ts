import { optionRepository, productRepository } from '../repositories';
import { OptionType } from '../types';
import { Option } from '../entities';

const createOptions = async (productId: string, options: Array<OptionType>) => {
  try {
    const product = await productRepository.getProduct(productId);

    if (!product) {
      throw Error('잘못된 urlId 혹은 productId 입니다.');
    }

    const createdOptions = await optionRepository.saveOptions(optionRepository.createOptions(options));
    product.options = [...createdOptions, ...product.options];

    return {
      effectedProduct: await productRepository.saveProducts(product),
      createdOptions,
    };
  } catch (error) {
    return {
      errorMessage: String(error),
    };
  }
};

const removeOptions = async (optionIds: string) => {
  try {
    return {
      ...(await optionRepository.removeOptions(optionIds)),
    };
  } catch (error) {
    return {
      errorMessage: String(error),
    };
  }
};

const updateOptions = async (options: Array<Option>) => {
  try {
    return {
      ...(await optionRepository.updateOptions(options)),
    };
  } catch (error) {
    return {
      errorMessage: String(error),
    };
  }
};

export default {
  createOptions,
  removeOptions,
  updateOptions,
};
