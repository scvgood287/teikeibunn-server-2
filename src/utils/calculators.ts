import {
  fansignTypes,
  fansignConfigs,
  fansignTypeKeys,
  SPLIT_MARK,
  normalTypes,
  constantsEventTypes,
  constantsEventTypeKeys,
  attendTypes,
  attendTypeKeys,
} from '../constants';

export const isPrimitive = (value: any) => value === null || !(typeof value == 'object' || typeof value == 'function');

export const trimAllForObject = (obj: any): Object =>
  isPrimitive(obj)
    ? typeof obj === 'string'
      ? obj.trim()
      : obj
    : typeof obj === 'object'
    ? Array.isArray(obj)
      ? obj.map(trimAllForObject)
      : Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [key]: trimAllForObject(value) }), {})
    : obj;

export const checkNewTitle = (title: string) =>
  title.includes('イベント') &&
  (title.includes('対面') || title.includes('ヨントン') || title.includes('特典') || title.includes('ラキドロ') || title.toUpperCase().includes('SHOWCASE'));

export const fullNumberToHalfNumber = (fullNumber: string) => fullNumber.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

export const trimAll = (value: string) => value.replace(/(\s*)/g, '');

export const dateStringToDate = (dateString: string): { year: number; month: number; day: number; hour: number; minutes: number } => {
  if (dateString?.match(/年|月|日/g)) {
    const [date, _day, time] = dateString.replace(/\s/g, '').split(/\(|\)/g);
    const [year, month, day] = date.split(/年|月|日/g).map(Number);
    const hourIndex = time.match(/時/)?.index;
    const minutesIndex = time.match(/分/)?.index;
    const hour = hourIndex ? Number(time.slice(0, hourIndex)) : 0;
    const minutes = hourIndex && minutesIndex ? Number(time.slice(hourIndex + 1, minutesIndex)) : 0;

    return {
      year,
      month,
      day,
      hour,
      minutes,
    };
  }

  return {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minutes: 0,
  };
};

export const analyze = async ({ title, ptexts }: { title: string; ptexts: string }) => {
  const [group, eventDescription] = fullNumberToHalfNumber(title).split(SPLIT_MARK).filter(Boolean);
  const eventDateOfTitle = eventDescription.split(/\s|!|！/g).find(word => word.includes('/') && word.split('/').every(letter => !isNaN(Number(letter)))) || '';
  const subTitle = ptexts.slice(ptexts.indexOf(SPLIT_MARK), ptexts.indexOf(eventDescription) + eventDescription.length);
  const isSpecialEvent = eventDescription.toUpperCase().includes('SP');
  const eventText = eventDescription.replace(new RegExp(`!|！${!!eventDateOfTitle ? `|(${eventDateOfTitle})` : ''}${isSpecialEvent ? '|(SP)' : ''}`, 'g'), '');
  const isConstantsType = eventText.includes('イベント');
  const fansignType = isConstantsType
    ? constantsEventTypes[constantsEventTypeKeys.find(key => eventText.includes(key)) as keyof { [key: string]: string }]
    : eventText;

  return {
    isSeasonsGreetings: subTitle.toUpperCase().includes("SEASON'S GREETINGS"),
    eventDateOfTitle,
    group,
    fansignType,
    fansignConfig: attendTypes[attendTypeKeys.find(type => subTitle.includes(type)) as keyof {}] || 'none',

    isConstantsType,
    isSpecialEvent,
  };
};

export const oldAnalyze = async ({ title, ptexts }: { title: string; ptexts: string }) => {
  const isNewTitle = checkNewTitle(title);

  const splitedTitle = title.split(/\s/g);
  const fansignTypeIndex = splitedTitle.findIndex(el => (isNewTitle ? checkNewTitle(el) : el.includes('!') || el.includes('！') || el.includes('サイン会')));
  const group = splitedTitle.slice(0, fansignTypeIndex).join(' ');
  const fansignTypeText = fansignTypeKeys.reduce((acc, curr) => (splitedTitle[fansignTypeIndex].includes(curr) ? curr : acc), 'ヨントン');

  const isSeasonsGreetings = title.includes('シーズン') || title.toUpperCase().includes('SEASON');
  const eventDateOfTitle =
    splitedTitle.slice(fansignTypeIndex + 1).filter(word => word.includes('/') && word.split('/').every(letter => !isNaN(Number(letter))))[0] || '';

  const startOfFansignTypeDetail = ptexts.indexOf(SPLIT_MARK);
  const fansignTypeDetailText = ptexts.includes(SPLIT_MARK)
    ? ptexts.slice(startOfFansignTypeDetail + 1, ptexts.indexOf(SPLIT_MARK, startOfFansignTypeDetail + 1))
    : '';
  const fansignTypeDetailTextToUpperCase = fansignTypeDetailText.toUpperCase();
  const fansignType =
    !fansignTypeDetailTextToUpperCase.includes('SP') && normalTypes.some(type => fansignTypeDetailTextToUpperCase.includes(type))
      ? fansignTypes[fansignTypeText]
      : fansignTypeDetailText;

  return {
    isSeasonsGreetings,
    eventDateOfTitle,
    group,
    fansignType,
    fansignConfig:
      fansignTypeText === 'ビデオ' || fansignTypeText === '対面' || fansignTypeText === 'ヨントン'
        ? Object.entries(fansignConfigs).filter(([, words]) => words.some(word => title.includes(word)))[0]?.[0] || 'none'
        : 'none',
  };
};
