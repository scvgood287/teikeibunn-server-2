import { versions } from '../constants';
import { optionsService } from '../services';
import { UpdateOptionsRequestHandler, RemoveOptionsRequestHandler, CreateOptionsRequestHandler } from '../types';

const createOptions: CreateOptionsRequestHandler = async (req, res, next) => {
  try {
    const {
      body,
      params: { productId },
    } = req;

    const { errorMessage, ...result } = await optionsService.createOptions(productId, body);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(201).json({ versions, result });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const removeOptions: RemoveOptionsRequestHandler = async (req, res, next) => {
  try {
    const {
      params: { optionIds },
    } = req;

    const { errorMessage, ...result } = await optionsService.removeOptions(optionIds);

    if (errorMessage) {
      throw Error(errorMessage);
    }

    res.status(200).json({ versions, result });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};

const updateOptions: UpdateOptionsRequestHandler = async (req, res, next) => {
  try {
    const { body } = req;

    const { errorMessage, ...result } = await optionsService.updateOptions(body);

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
  createOptions,
  removeOptions,
  updateOptions,
};
