import { AttendTypes, EventTypes, EventInfos, EventDateInfos, CrawlEventInfoResult, DateInfo } from '../types';
import dotenv from 'dotenv';

dotenv.config();

// String

export const FAN_MEETING = 'FAN MEETING';

export const ONE_ON_ONE = 'oneOnOne';
export const UNIT = 'unit';
export const ALL = 'all';

export const SPLIT_MARK = '⭐';
export const SHOP = '販売店';
export const EVENT_DATE = 'イベント日時';
export const EVENT_ENTRY_PERIOD = 'イベント応募期限';
export const DEPOSIT_DEADLINE = '最終入金締切';
export const WINNER_ANNOUNCEMENT = '当選発表';

export const ALBUM = 'album';
export const PRODUCT = 'product';

export const NONE = 'none';

export const NAME = 'name';
export const OPTIONS = 'options';
export const PRICE = 'price';

export const EVENT_INFO = 'eventInfo';

export const PRE_URL_ID = 'https://ameblo.jp/zoa959595/entry-';
export const POST_URL_ID = '.html';

// Calculated

export const isProduction = process.env.NODE_ENV === 'production';

export const eventTypes: EventTypes = {
  ヨントン: 'video',
  ビデオ: 'video',
  対面: 'meet',
  ラキドロ: 'luckyDraw',
  特典: 'specialGoods',
  SHOWCASE: 'showcase',
  [FAN_MEETING]: 'fanMeeting',
};

export const attendTypes: AttendTypes = {
  '1:1': ONE_ON_ONE,
  ユニット: UNIT,
  団体: ALL,
};

export const EVENT_DATE_INFOS: EventDateInfos = {
  eventDate: EVENT_DATE,
  depositDeadline: DEPOSIT_DEADLINE,
  winnerAnnouncement: WINNER_ANNOUNCEMENT,
};

export const EVENT_INFOS: EventInfos = {
  shop: SHOP,
  eventEntryPeriod: EVENT_ENTRY_PERIOD,
  ...EVENT_DATE_INFOS,
};

export const versions = {
  server: '2.0.1',
  client: '2.0.2',
};

export const eventInfoRegex = new RegExp(
  Object.values(EVENT_INFOS)
    .reduce((regex, INFO) => regex + `(${INFO})|`, '')
    .slice(0, -1),
  'g',
);

// reuseable

export const eventTypeKeys = Object.keys(eventTypes);
export const attendTypeKeys = Object.keys(attendTypes);

// default

export const crawlEventInfoResultDefault: CrawlEventInfoResult = {
  shop: '',
  eventEntryStartDate: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },
  eventDeadline: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },

  eventDate: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },
  depositDeadline: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },
  winnerAnnouncement: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },

  prices: [],
  agencyFees: [],

  group: '',
  eventDateOfTitle: '',
  eventConfig: 'none',
  eventType: '',

  isSeasonsGreetings: false,
  isSpecialEvent: false,
};

export const dateInfoDefault: DateInfo = {
  year: 0,
  month: 0,
  day: 0,
  hour: 0,
  minutes: 0,
};
