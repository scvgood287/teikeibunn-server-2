import { AnalyzeFunction, DateInfo } from '../types';
import { eventTypes, eventTypeKeys, attendTypes, attendTypeKeys, NONE, PRE_URL_ID, POST_URL_ID, DATE_PATTERNS, AMEBLO_JP_TEXT_PATTERNS } from '../constants';

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

export const dateStringToDateInfo = (dateString: string): DateInfo =>
  DATE_PATTERNS.reduce<DateInfo>(
    (acc, [prop, pattern]) => ({
      ...acc,
      [prop]: toRightNumber(
        dateString
          .match(new RegExp(`-?\\d+${pattern}`))?.[0]
          .match(/-?\d+/)?.[0]
          .replace(/\-/g, ''),
      ),
    }),
    {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minutes: 0,
    },
  );

export const initializeAmebloText = (text: string): string =>
  fullNumberToHalfNumber(
    AMEBLO_JP_TEXT_PATTERNS.reduce<string>((text, [froms, to]) => text.replace(new RegExp(froms.map(from => '\\' + from).join('|'), 'g'), to), text),
  );

export const analyze: AnalyzeFunction = subTitle => {
  const eventDescriptionsText = subTitle.trim();
  const isSeasonsGreetings = eventDescriptionsText.toUpperCase().includes("SEASON'S GREETINGS");
  const eventConfigText = attendTypeKeys.find(type => eventDescriptionsText.includes(type));

  const eventDescriptions = eventDescriptionsText
    .replace(new RegExp(`!|(SEASON'S GREETINGS)${eventConfigText ? `|${eventConfigText}` : ''}`, 'g'), '')
    .trim()
    .split(/\s+/)
    .filter(text => Boolean(text) && !/^\d{1,2}\/\d{1,2}$/.test(text) && text !== '◆');

  const isSpecialEvent = eventDescriptions[0].toUpperCase() === 'SP';
  const eventText = eventDescriptions.slice(isSpecialEvent ? 1 : 0).join(' ');
  const eventTypeText = eventTypeKeys.find(key => eventText.includes(key));

  return {
    isSeasonsGreetings,
    isSpecialEvent,
    eventType: eventText.includes('イベント') && eventTypeText ? eventTypes[eventTypeText] : eventText,
    eventConfig: eventConfigText ? attendTypes[eventConfigText] : NONE,
  };
};

export const toPlaneText = (str: string) => str.replace(/\s/g, '').toUpperCase();

export const isSameString = (a: string, b: string) => toPlaneText(a) === toPlaneText(b);

export const isIncludeString = (sentence: string, str: string) => toPlaneText(sentence).includes(toPlaneText(str));
