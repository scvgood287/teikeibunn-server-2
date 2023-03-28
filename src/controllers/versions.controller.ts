import { RequestHandler } from 'express';
import { versionsService } from '../services';

const getVersions: RequestHandler = (req, res, next) => {
  try {
    const versions = versionsService.getVersions();

    res.status(200).json(versions);
  } catch (error) {
    console.error(error);
    res.status(400);
  }
};

export default {
  getVersions,
};
