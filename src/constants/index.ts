export const fansignTypes: { [key: string]: string } = {
  ヨントン: 'video',
  ビデオ: 'video',
  対面: 'meet',
  ラキドロ: 'luckyDraw',
  特典: 'specialGoods',
  SHOWCASE: 'showcase',
};

export const FAN_MEETING: string = 'FAN MEETING';
export const constantsEventTypes = {
  ...fansignTypes,
  [FAN_MEETING]: 'fanMeeting',
};

export const constantsEventTypeKeys = Object.keys(constantsEventTypes);

export const fansignTypeKeys = Object.keys(fansignTypes);
export const normalTypes = Object.entries(fansignTypes)
  .reduce((acc, curr) => [...acc, ...curr], ['CALL'])
  .map(text => text.toUpperCase());

export const ONE_ON_ONE = 'oneOnOne';
export const UNIT = 'unit';
export const ALL = 'all';
export const attendTypes = {
  '1:1': ONE_ON_ONE,
  ユニット: UNIT,
  団体: ALL,
};
export const attendTypeKeys = Object.keys(attendTypes);

export const fansignConfigs = {
  [ONE_ON_ONE]: ['1:1', '個人', '個別'],
  [UNIT]: ['ユニット'],
  [ALL]: ['団体'],
};

export const SPLIT_MARK = '⭐';
export const SHOP = '販売店';
export const EVENT_DATE = 'イベント日時';
export const EVENT_ENTRY_PERIOD = 'イベント応募期限';
export const DEPOSIT_DEADLINE = '最終入金締切';
export const WINNER_ANNOUNCEMENT = '当選発表';

export const FANSIGN_INFOS = {
  shop: SHOP,
  eventDate: EVENT_DATE,
  eventEntryPeriod: EVENT_ENTRY_PERIOD,
  depositDeadline: DEPOSIT_DEADLINE,
  winnerAnnouncement: WINNER_ANNOUNCEMENT,
};

export const versions = {
  server: '1.2.8',
  client: '1.3.9',
};

export const fansignInfoRegex = new RegExp(
  Object.values(FANSIGN_INFOS)
    .reduce((regex, INFO) => regex + `(${INFO})|`, '')
    .slice(0, -1),
  'g',
);

export const NAME = 'name';
export const OPTIONS = 'options';
export const PRICE = 'price';

export const products = [
  {
    [NAME]: 'Peridot String Bracelet (탄생석끈팔찌)',
    [PRICE]: 35000,
    [OPTIONS]: [
      {
        [NAME]: 'WHITE',
        [PRICE]: 1000,
      },
      {
        [NAME]: 'BLACK',
        [PRICE]: 2000,
      },
      {
        [NAME]: 'S',
        [PRICE]: 3000,
      },
      {
        [NAME]: 'M',
        [PRICE]: 4000,
      },
      {
        [NAME]: 'L',
        [PRICE]: 5000,
      },
    ],
  },
  {
    [NAME]: 'Real Heart Ring (하트통통반지)',
    [PRICE]: 82500,
    [OPTIONS]: [
      {
        [NAME]: 'WHITE',
        [PRICE]: 1000,
      },
      {
        [NAME]: 'BLACK',
        [PRICE]: 2000,
      },
      {
        [NAME]: 'S',
        [PRICE]: 3000,
      },
      {
        [NAME]: 'M',
        [PRICE]: 4000,
      },
      {
        [NAME]: 'L',
        [PRICE]: 5000,
      },
    ],
  },
  {
    [NAME]: 'Carve ring (각인반지)',
    [PRICE]: 52000,
    [OPTIONS]: [
      {
        [NAME]: 'WHITE',
        [PRICE]: 1000,
      },
      {
        [NAME]: 'BLACK',
        [PRICE]: 2000,
      },
      {
        [NAME]: 'S',
        [PRICE]: 3000,
      },
      {
        [NAME]: 'M',
        [PRICE]: 4000,
      },
      {
        [NAME]: 'L',
        [PRICE]: 5000,
      },
    ],
  },
  {
    [NAME]: 'Peridot Ring (탄생석반지)',
    [PRICE]: 93000,
    [OPTIONS]: [
      {
        [NAME]: 'WHITE',
        [PRICE]: 1000,
      },
      {
        [NAME]: 'BLACK',
        [PRICE]: 2000,
      },
      {
        [NAME]: 'S',
        [PRICE]: 3000,
      },
      {
        [NAME]: 'M',
        [PRICE]: 4000,
      },
      {
        [NAME]: 'L',
        [PRICE]: 5000,
      },
    ],
  },
  {
    [NAME]: 'Carve Necklace (각인목걸이)',
    [PRICE]: 86000,
    [OPTIONS]: [
      {
        [NAME]: 'WHITE',
        [PRICE]: 1000,
      },
      {
        [NAME]: 'BLACK',
        [PRICE]: 2000,
      },
      {
        [NAME]: 'S',
        [PRICE]: 3000,
      },
      {
        [NAME]: 'M',
        [PRICE]: 4000,
      },
      {
        [NAME]: 'L',
        [PRICE]: 5000,
      },
    ],
  },
  {
    [NAME]: 'Castle Bold Ring (캐슬반지)',
    [PRICE]: 151000,
    [OPTIONS]: [
      {
        [NAME]: 'WHITE',
        [PRICE]: 1000,
      },
      {
        [NAME]: 'BLACK',
        [PRICE]: 2000,
      },
      {
        [NAME]: 'S',
        [PRICE]: 3000,
      },
      {
        [NAME]: 'M',
        [PRICE]: 4000,
      },
      {
        [NAME]: 'L',
        [PRICE]: 5000,
      },
    ],
  },
  {
    [NAME]: 'Loop Earcuff Silver (루프이어커프)',
    [PRICE]: 44000,
    [OPTIONS]: [
      {
        [NAME]: 'WHITE',
        [PRICE]: 1000,
      },
      {
        [NAME]: 'BLACK',
        [PRICE]: 2000,
      },
      {
        [NAME]: 'S',
        [PRICE]: 3000,
      },
      {
        [NAME]: 'M',
        [PRICE]: 4000,
      },
      {
        [NAME]: 'L',
        [PRICE]: 5000,
      },
    ],
  },
];
