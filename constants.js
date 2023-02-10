const fansignTypes = {
  ヨントン: 'video',
  ビデオ: 'video',
  対面: 'meet',
  ラキドロ: 'luckyDraw',
  特典: 'specialGoods',
  SHOWCASE: 'showcase',
};

const ONE_ON_ONE = 'oneOnOne';
const UNIT = 'unit';
const ALL = 'all';

const fansignConfigs = {
  [ONE_ON_ONE]: ['1:1', '個人', '個別'],
  [UNIT]: ['ユニット'],
  [ALL]: ['団体'],
};

const FANSIGN_TYPE_DETAIL = 'イベント名';
const SHOP = '販売店';
const EVENT_DATE = 'イベント日時';
const EVENT_DEADLINE = 'イベント応募期限';
const DEPOSIT_DEADLINE = '最終入金締切';
const WINNER_ANNOUNCEMENT = '当選発表';

const FANSIGN_INFOS = {
  fansignTypeDetail: FANSIGN_TYPE_DETAIL,
  shop: SHOP,
  eventDate: EVENT_DATE,
  eventDeadline: EVENT_DEADLINE,
  depositDeadline: DEPOSIT_DEADLINE,
  winnerAnnouncement: WINNER_ANNOUNCEMENT,
};

module.exports = {
  fansignTypes,
  fansignConfigs,
  ONE_ON_ONE,
  UNIT,
  ALL,
  EVENT_DATE,
  SHOP,
  EVENT_DEADLINE,
  DEPOSIT_DEADLINE,
  WINNER_ANNOUNCEMENT,
  FANSIGN_INFOS,
};
