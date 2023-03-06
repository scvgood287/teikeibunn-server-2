const puppeteer = require('puppeteer');
const {
  fansignTypes,
  fansignConfigs,
  fansignInfoRegex,
  fansignTypeKeys,
  FANSIGN_INFOS,
  SPLIT_MARK,
  versions,
  normalTypes,
  constantsEventTypes,
  constantsEventTypeKeys,
  attendTypes,
  attendTypeKeys,
} = require('./constants');

const isPrimitive = value => value === null || !(typeof value == 'object' || typeof value == 'function');

const trimAll = value => (typeof value === 'string' ? value.replace(/(\s*)/g, '') : value);

const trimAllForObject = obj =>
  isPrimitive(obj)
    ? typeof obj === 'string'
      ? obj.trim()
      : obj
    : typeof obj === 'object'
    ? Array.isArray(obj)
      ? obj.map(trimAllForObject)
      : Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [key]: trimAllForObject(value) }), {})
    : obj;

const checkNewTitle = title =>
  title.includes('イベント') &&
  (title.includes('対面') || title.includes('ヨントン') || title.includes('特典') || title.includes('ラキドロ') || title.toUpperCase().includes('SHOWCASE'));

const fullNumberToHalfNumber = fullNumber => fullNumber.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

const dateStringToDate = dateString => {
  if (dateString?.match(/年|月|日/g)) {
    const [date, _day, time] = dateString.replace(/\s/g, '').split(/\(|\)/g);
    const [year, month, day] = date.split(/年|月|日/g).map(Number);
    const hourIndex = time.match(/時/)?.index;
    const minutesIndex = time.match(/分/)?.index;
    const hour = hourIndex ? Number(time.slice(0, hourIndex)) : 0;
    const minutes = minutesIndex ? Number(time.slice(hourIndex + 1, minutesIndex)) : 0;

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

const oldAnalyze = async ({ title, ptexts }) => {
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

const analyze = async ({ title, ptexts }) => {
  const [group, eventDescription] = fullNumberToHalfNumber(title).split(SPLIT_MARK).filter(Boolean);
  const eventDateOfTitle = eventDescription.split(/\s|!|！/g).find(word => word.includes('/') && word.split('/').every(letter => !isNaN(Number(letter)))) || '';
  const subTitle = ptexts.slice(ptexts.indexOf(SPLIT_MARK), ptexts.indexOf(eventDescription) + eventDescription.length);
  const isSpecialEvent = eventDescription.toUpperCase().includes('SP');
  const eventText = eventDescription.replace(new RegExp(`!|！${!!eventDateOfTitle ? `|(${eventDateOfTitle})` : ''}${isSpecialEvent ? '|(SP)' : ''}`, 'g'), '');
  const isConstantsType = eventText.includes('イベント');
  const fansignType = isConstantsType ? constantsEventTypes[constantsEventTypeKeys.find(key => eventText.includes(key))] : eventText;

  return {
    isSeasonsGreetings: subTitle.toUpperCase().includes("SEASON'S GREETINGS"),
    eventDateOfTitle,
    group,
    fansignType,
    fansignConfig: attendTypes[attendTypeKeys.find(type => subTitle.includes(type))] || 'none',

    isConstantsType,
    isSpecialEvent,
  };
};

const crawlFansignInfo = async url => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const { title, ps } = await page.evaluate(() => ({
      title: document.getElementsByClassName('skinArticleTitle')[0].innerText,
      ps: [...document.getElementsByTagName('p')].map(p => p.innerText),
    }));
    const isNewTitle = title.includes(SPLIT_MARK);
    const ptexts = fullNumberToHalfNumber(ps.join(''));
    const splitedPs = ptexts.split(fansignInfoRegex).filter(Boolean);

    const [prices, agencyFees] = ptexts.split('代行手数料').map(text => text.match(/([0-9]|\s)+円/g).map(price => price.replace(/円|\s/g, '')));
    const { shop, ...dates } = Object.entries(FANSIGN_INFOS).reduce((texts, [info, infoText]) => {
      const infoIndex = splitedPs.findIndex(innerText => innerText.includes(infoText)) + 1;
      texts[info] = !!infoIndex ? splitedPs[infoIndex].trim().split(/◆|場所/g).filter(Boolean)[0].split('👉').filter(Boolean)[0].replace(/:|：/g, '') : '';

      return texts;
    }, {});
    dates.eventDeadline = dates.eventDeadline.split(/~|〜/g)[1];

    return trimAllForObject({
      serverSideVersions: versions,
      isNewTitle,
      prices,
      agencyFees,
      shop,
      ...Object.entries(dates).reduce((details, [info, dateString]) => {
        details[info] = dateStringToDate(dateString);

        return details;
      }, {}),
      ...(await (isNewTitle ? analyze : oldAnalyze)({ title, ptexts })),
    });
  } catch (err) {
    throw Error(err);
  } finally {
    await browser.close();
  }
};

const imitateHTML = async url => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'],
  });

  try {
    // const load = await browser.newPage();
    // await load.setCacheEnabled(false);
    // await load.goto(url, { waitUntil: 'load' });
    // const HTML = await load.content();
    // console.log('load');

    // const domcontentloaded = await browser.newPage();
    // await domcontentloaded.setCacheEnabled(false);
    // await domcontentloaded.goto(url, { waitUntil: 'domcontentloaded' });
    // const HTML = await domcontentloaded.content();
    // console.log('domcontentloaded');

    const networkidle0 = await browser.newPage();
    await networkidle0.setCacheEnabled(false);
    await networkidle0.goto(url, { waitUntil: 'networkidle0' });
    const HTML = await networkidle0.content();

    // const networkidle2 = await browser.newPage();
    // await networkidle2.setCacheEnabled(false);
    // await networkidle2.goto(url, { waitUntil: 'networkidle2' });
    // const HTML = await networkidle2.content();
    // console.log('networkidle2');

    return HTML;
  } catch (err) {
    throw Error(err);
  } finally {
    await browser.close();
  }
};

module.exports = { crawlFansignInfo, imitateHTML, isPrimitive, trimAll, trimAllForObject };

// `waitUntil`:When to consider navigation succeeded, defaults to `load`. Given an array of event strings, navigation is considered to be successful after all events have been fired. Events can be either:<br/>
// `load` : consider navigation to be finished when the load event is fired.<br/>
// `domcontentloaded` : consider navigation to be finished when the DOMContentLoaded event is fired.<br/>
// `networkidle0` : consider navigation to be finished when there are no more than 0 network connections for at least `500` ms.<br/>
// `networkidle2` : consider navigation to be finished when there are no more than 2 network connections for at least `500` ms.
