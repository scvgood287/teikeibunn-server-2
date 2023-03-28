import { RequestHandler } from 'express';

export const invalidRouteHandlerRequestHandler: RequestHandler = (req, res, next) => {
  const error = new Error(`${req.method} ${req.url} not found`);
  next(error);
};
