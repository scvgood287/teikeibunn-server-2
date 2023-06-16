import { Request, Response, NextFunction } from 'express';
import { Browser, Page } from 'puppeteer';
import { Product, Option } from '../entities';
import {
  ALBUM,
  PRODUCT,
  DEPOSIT_DEADLINE,
  EVENT_DATE_INFOS,
  attendTypes,
  eventTypes,
  FAN_MEETING,
  ONE_ON_ONE,
  UNIT,
  ALL,
  EVENT_DATE,
  DEPOSIT_DEADLINE,
  WINNER_ANNOUNCEMENT,
  SHOP,
  WINNERS_NUMBER,
  EVENT_ENTRY_PERIOD,
  NONE,
  NAME,
  OPTIONS,
  PRICE,
  DATE_PATTERN_YEAR,
  DATE_PATTERN_MONTH,
  DATE_PATTERN_DAY,
  DATE_PATTERN_HOUR,
  DATE_PATTERN_MINUTES,
  EARLY_END,
  PLACE,
} from '../constants';

declare global {
  var isRedisReady: boolean;
  var isDbReady: boolean;
}

export type ValueOf<T> = T[keyof T];

export type OptionType = {
  [NAME]: string;
  [PRICE]: number;
  lotteryticket: number;
};

export type ProductType = {
  [NAME]: string;
  [PRICE]: number;
  lotteryticket: number;
  [OPTIONS]: Array<OptionType>;
};

export type BaseParamsType = { urlId: string };

export type BaseCacheBodyType = {
  cache: CacheTypes;
};

export type CacheTypes = {
  eventInfo: EventInfo<typeof ALBUM | typeof PRODUCT> | null;
  products: { products: Product[] } | null;
};

export type BaseRequestHandler = (req: Request<BaseParamsType, {}, {}, {}>, res: Response, next: NextFunction) => Promise<void> | void;

export type AmebloRequestHandler<T extends typeof ALBUM | typeof PRODUCT> = (
  req: Request<BaseParamsType, {}, BaseCacheBodyType, {}>,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export type CacheRequestHandler = (req: Request<BaseParamsType, {}, BaseCacheBodyType, {}>, res: Response, next: NextFunction) => Promise<void> | void;

export type UpdateEventInfoCacheRequestHandler = (
  req: Request<BaseParamsType, {}, BaseCacheBodyType, { productType: typeof ALBUM | typeof PRODUCT }>,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export type GetProductsRequestHandler = (req: Request<BaseParamsType, {}, BaseCacheBodyType, {}>, res: Response, next: NextFunction) => Promise<void> | void;

export type CreateProductsRequestHandler = (
  req: Request<BaseParamsType, {}, Array<ProductType>, {}>,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export type CreateOptionsRequestHandler = (
  req: Request<{ productId: string }, {}, Array<OptionType>, {}>,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export type RemoveProductsRequestHandler = (req: Request<{ productIds: string }, {}, {}, {}>, res: Response, next: NextFunction) => Promise<void> | void;

export type RemoveOptionsRequestHandler = (req: Request<{ optionIds: string }, {}, {}, {}>, res: Response, next: NextFunction) => Promise<void> | void;

export type UpdateProductsRequestHandler = (req: Request<{}, {}, Array<Product>, {}>, res: Response, next: NextFunction) => Promise<void> | void;

export type UpdateOptionsRequestHandler = (req: Request<{}, {}, Array<Option>, {}>, res: Response, next: NextFunction) => Promise<void> | void;

export interface GetEventInfoAndProductsResult {
  eventInfo: {
    saveCache: boolean;
    errorMessage: string;
    result:
      | {
          eventInfo: Partial<CrawlEventInfoResult>;
          productType: typeof PRODUCT | typeof ALBUM;
        }
      | {};
  };
  product: {
    saveCache: boolean;
    errorMessage: string;
    result:
      | {
          products: Product[];
        }
      | {};
  };
}

export type BrowserInstance = {
  id: number;
  states: {
    inUse: boolean;
  };
  browser: Browser;
};

export type BrowserFunction<A, R> = (browser: Browser, args: A) => Promise<{ pages: Page[]; result?: R; errorMessage?: string }>;

export type DateInfo = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minutes: number;
};

export interface EventTypes {
  ヨントン: 'video';
  ビデオ: 'video';
  対面: 'meet';
  ラキドロ: 'luckyDraw';
  特典: 'specialGoods';
  SHOWCASE: 'showcase';
  [FAN_MEETING]: 'fanMeeting';
}

export interface AttendTypes {
  '1:1': typeof ONE_ON_ONE;
  ユニット: typeof UNIT;
  団体: typeof ALL;
}

export type EventDateInfos = {
  eventDate: typeof EVENT_DATE;
  depositDeadline: typeof DEPOSIT_DEADLINE;
  winnerAnnouncement: typeof WINNER_ANNOUNCEMENT;
};

export interface EventInfos extends EventDateInfos {
  earlyEnd: typeof EARLY_END;
  place: typeof PLACE;
  shop: typeof SHOP;
  winnersNumber: typeof WINNERS_NUMBER;
  eventEntryPeriod: typeof EVENT_ENTRY_PERIOD;
}

export interface Versions {
  server: string;
  client: string;
}

export interface AnalyzeResult {
  eventConfig: ValueOf<typeof attendTypes> | typeof NONE;
  eventType: ValueOf<typeof eventTypes> | string;

  isSeasonsGreetings: boolean;
  isSpecialEvent: boolean;
}

export type AnalyzeFunction = (subTitle: string) => AnalyzeResult;

export interface CrawlEventInfoResult extends AnalyzeResult {
  group: string;
  shop: string;
  earlyEnd: string;
  place: string;
  winnersNumber: string;
  eventEntryStartDate: DateInfo;
  eventDeadline: DateInfo;

  eventDate: DateInfo;
  depositDeadline: DateInfo;
  winnerAnnouncement: DateInfo;

  prices: Array<number>;
  agencyFees: Array<number>;
}

export interface BaseCrawlEventInfoResult {
  shop: string;
  eventEntryStartDate: DateInfo;
  eventDeadline: DateInfo;

  eventDate: DateInfo;
  depositDeadline: DateInfo;
  winnerAnnouncement: DateInfo;

  group: string;
  eventConfig: ValueOf<typeof attendTypes> | typeof NONE;
  eventType: ValueOf<typeof eventTypes> | string;
}

export interface EventInfo<T extends typeof ALBUM | typeof PRODUCT> {
  productType: T;
  eventInfo: Partial<CrawlEventInfoResult>;
}

export type DATE_PATTERN =
  | typeof DATE_PATTERN_YEAR
  | typeof DATE_PATTERN_MONTH
  | typeof DATE_PATTERN_DAY
  | typeof DATE_PATTERN_HOUR
  | typeof DATE_PATTERN_MINUTES;
