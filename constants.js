const fansignTypes = {
  ヨントン: 'video',
  ビデオ: 'video',
  対面: 'meet',
  ラキドロ: 'luckyDraw',
  特典: 'specialGoods',
  SHOWCASE: 'showcase',
};

const FAN_MEETING = 'FAN MEETING';
const constantsEventTypes = {
  ...fansignTypes,
  [FAN_MEETING]: 'fanMeeting',
};

const constantsEventTypeKeys = Object.keys(constantsEventTypes);

const fansignTypeKeys = Object.keys(fansignTypes);
const normalTypes = Object.entries(fansignTypes)
  .reduce((acc, curr) => [...acc, ...curr], ['CALL'])
  .map(text => text.toUpperCase());

const ONE_ON_ONE = 'oneOnOne';
const UNIT = 'unit';
const ALL = 'all';
const attendTypes = {
  '1:1': ONE_ON_ONE,
  ユニット: UNIT,
  団体: ALL,
};
const attendTypeKeys = Object.keys(attendTypes);

const fansignConfigs = {
  [ONE_ON_ONE]: ['1:1', '個人', '個別'],
  [UNIT]: ['ユニット'],
  [ALL]: ['団体'],
};

const SPLIT_MARK = '⭐';
const SHOP = '販売店';
const EVENT_DATE = 'イベント日時';
const EVENT_DEADLINE = 'イベント応募期限';
const DEPOSIT_DEADLINE = '最終入金締切';
const WINNER_ANNOUNCEMENT = '当選発表';

const FANSIGN_INFOS = {
  shop: SHOP,
  eventDate: EVENT_DATE,
  eventDeadline: EVENT_DEADLINE,
  depositDeadline: DEPOSIT_DEADLINE,
  winnerAnnouncement: WINNER_ANNOUNCEMENT,
};

const versions = {
  server: '1.2.3',
  client: '1.3.2',
};

const fansignInfoRegex = new RegExp(
  Object.values(FANSIGN_INFOS)
    .reduce((regex, INFO) => regex + `(${INFO})|`, '')
    .slice(0, -1),
  'g',
);

module.exports = {
  fansignTypes,
  fansignConfigs,
  fansignInfoRegex,
  fansignTypeKeys,
  ONE_ON_ONE,
  UNIT,
  ALL,
  EVENT_DATE,
  SPLIT_MARK,
  SHOP,
  EVENT_DEADLINE,
  DEPOSIT_DEADLINE,
  WINNER_ANNOUNCEMENT,
  FANSIGN_INFOS,
  versions,
  normalTypes,
  constantsEventTypes,
  constantsEventTypeKeys,
  attendTypes,
  attendTypeKeys,
};
