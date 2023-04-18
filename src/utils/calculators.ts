import { AnalyzeFunction, AttendTypes, EventTypes } from '../types';
import { SPLIT_MARK, eventTypes, eventTypeKeys, attendTypes, attendTypeKeys, NONE, PRE_URL_ID, POST_URL_ID, dateInfoDefault } from '../constants';

const calculateByUnit = {
  day: (milliseconds: number) => milliseconds / (1000 * 60 * 60 * 24),
  hours: (milliseconds: number) => milliseconds / (1000 * 60 * 60),
  minutes: (milliseconds: number) => milliseconds / (1000 * 60),
  seconds: (milliseconds: number) => milliseconds / 1000,
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

export const dateStringToDate = (dateString: string): { year: number; month: number; day: number; hour: number; minutes: number } => {
  if (dateString?.match(/年|月|日/g)) {
    const [date, _day, time] = dateString.replace(/\s/g, '').split(/\(|\)/g);
    const [year, month, day] = date.split(/年|月|日/g).map(Number);
    const hourIndex = time.match(/時/)?.index;
    const minutesIndex = time.match(/分/)?.index;
    const hour = hourIndex ? Number(time.slice(0, hourIndex)) : 0;
    const minutes = hourIndex && minutesIndex ? Number(time.slice(hourIndex + 1, minutesIndex)) : 0;

    return {
      year: year || 0,
      month: month || 0,
      day: day || 0,
      hour,
      minutes,
    };
  }

  return dateInfoDefault;
};

export const analyze: AnalyzeFunction = ({ title, ptexts }) => {
  const [group, eventDescription] = fullNumberToHalfNumber(title).split(SPLIT_MARK).filter(Boolean);
  const eventDateOfTitle = eventDescription.split(/\s|!|！/g).find(word => word.includes('/') && word.split('/').every(letter => !isNaN(Number(letter)))) || '';
  const subTitle = ptexts.slice(ptexts.indexOf(SPLIT_MARK), ptexts.indexOf(eventDescription) + eventDescription.length);
  const isSpecialEvent = eventDescription.toUpperCase().includes('SP');
  const eventText = eventDescription.replace(new RegExp(`!|！${!!eventDateOfTitle ? `|(${eventDateOfTitle})` : ''}${isSpecialEvent ? '|(SP)' : ''}`, 'g'), '');

  return {
    isSeasonsGreetings: subTitle.toUpperCase().includes("SEASON'S GREETINGS"),
    isSpecialEvent,
    eventDateOfTitle,
    group,
    eventType: eventText.includes('イベント') ? eventTypes[eventTypeKeys.find(key => eventText.includes(key)) as keyof EventTypes] : eventText,
    eventConfig: attendTypes[attendTypeKeys.find(type => subTitle.includes(type)) as keyof AttendTypes] || NONE,
  };
};
