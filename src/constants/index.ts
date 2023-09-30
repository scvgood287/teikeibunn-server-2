import { AttendTypes, EventTypes, EventInfos, EventDateInfos, CrawlEventInfoResult, DateInfo } from '../types';
import dotenv from 'dotenv';

dotenv.config();

// String

export const FAN_MEETING = 'FAN MEETING';

export const ONE_ON_ONE = 'oneOnOne';
export const UNIT = 'unit';
export const ALL = 'all';

export const SPLIT_MARK = '⭐';
export const P_SPLIT_TEXT = 'P태그INNERTEXT구분용텍스트';
export const SHOP = '販売店';
export const PLACE = '場所';
export const EARLY_END = '⚠早期締め切り⚠';
export const SIGNIFICANT = '⚠確認事項⚠';
export const EXTRA_GOODS = 'イベント特典';
export const WINNERS_NUMBER = '当選人数';
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
  earlyEnd: EARLY_END,
  significant: SIGNIFICANT,
  extraGoods: EXTRA_GOODS,
  shop: SHOP,
  place: PLACE,
  winnersNumber: WINNERS_NUMBER,
  eventEntryPeriod: EVENT_ENTRY_PERIOD,
  ...EVENT_DATE_INFOS,
};

export const versions = {
  server: '2.0.8',
  client: '2.2.3',
};

export const eventInfoRegex = new RegExp(
  Object.values(EVENT_INFOS)
    .reduce((regex, INFO) => regex + `(${INFO})|`, '')
    .slice(0, -1),
  'g',
);

// reuseable

export const eventTypeKeys = ['ヨントン', 'ビデオ', '対面', 'ラキドロ', '特典', 'SHOWCASE', FAN_MEETING] as const;
export const attendTypeKeys = ['1:1', 'ユニット', '団体'] as const;

// default

export const crawlEventInfoResultDefault: CrawlEventInfoResult = {
  theme: '',
  shop: '',
  earlyEnd: '',
  significant: '',
  extraGoods: '',
  place: '',
  winnersNumber: '',
  eventEntryStartDate: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },
  eventDeadline: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },

  eventDate: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },
  depositDeadline: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },
  winnerAnnouncement: { year: 0, month: 0, day: 0, hour: 0, minutes: 0 },

  prices: [],
  agencyFees: [],
  specialGoods: {},

  group: '',
  eventConfig: 'none',
  eventType: '',

  isSeasonsGreetings: false,
  isSpecialEvent: false,
};

export const DATE_PATTERN_YEAR = '年' as const;
export const DATE_PATTERN_MONTH = '月' as const;
export const DATE_PATTERN_DAY = '日' as const;
export const DATE_PATTERN_HOUR = '時' as const;
export const DATE_PATTERN_MINUTES = '分' as const;

export const DATE_PATTERNS = [
  ['year', DATE_PATTERN_YEAR],
  ['month', DATE_PATTERN_MONTH],
  ['day', DATE_PATTERN_DAY],
  ['hour', DATE_PATTERN_HOUR],
  ['minutes', DATE_PATTERN_MINUTES],
] as const;

export const AMEBLO_JP_TEXT_PATTERNS = [
  [['ー'], '-'],
  [['〜'], '~'],
  [['\n', '　'], ' '],
  [['：'], ':'],
  [['！'], '!'],
] as const;

export const dateInfoDefault: DateInfo = {
  year: 0,
  month: 0,
  day: 0,
  hour: 0,
  minutes: 0,
};
