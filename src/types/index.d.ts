import { Request, Response, NextFunction } from 'express';
import { Browser, Page } from 'puppeteer';

export type PuppeteerRequestHandler = (
  req: Request<{}, {}, {}, { url: string; redisKey: string; cache: string }>,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export type BrowserInstance = {
  id: number;
  states: {
    inUse: boolean;
  };
  browser: Browser;
};

export type BrowserFunction<A, R> = (browser: Browser, args: A) => Promise<{ pages: Page[]; result: R }>;

declare global {
  var isRedisReady: boolean;
}
