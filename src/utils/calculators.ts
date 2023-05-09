import { AnalyzeFunction, AttendTypes, DATE_PATTERN, DateInfo, EventTypes, ValueOf } from '../types';
import { SPLIT_MARK, eventTypes, eventTypeKeys, attendTypes, attendTypeKeys, NONE, PRE_URL_ID, POST_URL_ID, DATE_PATTERNS } from '../constants';

const calculateByUnit = {
  day: (milliseconds: number) => milliseconds / (1000 * 60 * 60 * 24),
  hours: (milliseconds: number) => milliseconds / (1000 * 60 * 60),
  minutes: (milliseconds: number) => milliseconds / (1000 * 60),
  seconds: (milliseconds: number) => milliseconds / 1000,
};

export const toRightNumber = (strnum: any) => {
  const num = Number(strnum);

  return Number.isNaN(num) || num < 0 ? 0 : num;
};

export const calculateDateDiff = (start: Date, end: Date, unit: 'day' | 'hours' | 'minutes' | 'seconds' = 'seconds') =>
  calculateByUnit[unit](end.getTime() - start.getTime());

export const amebloUrlIdToUrl = (urlId: string) => `${PRE_URL_ID}${urlId}${POST_URL_ID}`;

export const isPrimitive = (value: any) => value === null || !(typeof value == 'object' || typeof value == 'function');

export const trimAllForObject = <T>(obj: any): T =>
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

export const getDateValueFromDateString = (date: string, pattern: DATE_PATTERN) =>
  toRightNumber(date.match(new RegExp(`-?\\d+${pattern}`))?.[0].match(/-?\d+/));

export const dateStringToDateInfo = (dateString: string): DateInfo =>
  DATE_PATTERNS.reduce<DateInfo>(
    (acc, [prop, pattern]) => ({ ...acc, [prop]: toRightNumber(dateString.match(new RegExp(`-?\\d+${pattern}`))?.[0].match(/-?\d+/)) }),
    {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minutes: 0,
    },
  );

export const analyze: AnalyzeFunction = ({ title, ptexts }) => {
  const [group, eventDescriptionText] = fullNumberToHalfNumber(title).split(SPLIT_MARK).filter(Boolean);
  const eventDescription = eventDescriptionText || '';
  const eventDateOfTitle = eventDescription.split(/\s|!|！/g).find(word => word.includes('/') && word.split('/').every(letter => !isNaN(Number(letter)))) || '';
  const subTitle = ptexts.slice(ptexts.indexOf(SPLIT_MARK), ptexts.indexOf(eventDescription) + eventDescription.length);
  const isSpecialEvent = eventDescription.toUpperCase().includes('SP');
  const eventText = eventDescription.replace(new RegExp(`!|！${!!eventDateOfTitle ? `|(${eventDateOfTitle})` : ''}${isSpecialEvent ? '|(SP)' : ''}`, 'g'), '');

  return {
    isSeasonsGreetings: subTitle.toUpperCase().includes("SEASON'S GREETINGS"),
    isSpecialEvent,
    eventDateOfTitle,
    group: group || '',
    eventType: eventText.includes('イベント') ? eventTypes[eventTypeKeys.find(key => eventText.includes(key)) as keyof EventTypes] : eventText,
    eventConfig: attendTypes[attendTypeKeys.find(type => subTitle.includes(type)) as keyof AttendTypes] || NONE,
  };
};

export const toPlaneText = (str: string) => str.replace(/\s/g, '').toUpperCase();

export const isSameString = (a: string, b: string) => toPlaneText(a) === toPlaneText(b);

export const isIncludeString = (sentence: string, str: string) => toPlaneText(sentence).includes(toPlaneText(str));
