const puppeteer = require('puppeteer');
const { fansignTypes, fansignConfigs, ONE_ON_ONE, FANSIGN_INFOS } = require('./constants');

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

const checkNewTitle = title => {
  const titleToUpperCase = title.toUpperCase();

  return (
    titleToUpperCase.includes('イベント') &&
    (titleToUpperCase.includes('対面') ||
      titleToUpperCase.includes('ヨントン') ||
      titleToUpperCase.includes('特典') ||
      titleToUpperCase.includes('ラキドロ') ||
      titleToUpperCase.includes('SHOWCASE'))
  );
};

const fullNumberToHalfNumber = fullNumber => fullNumber.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

const dateStringToDate = dateString => {
  if (dateString.match(/年|月|日/g)) {
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

  return dateString;
};

const crawl = async page => {
  const { title, ps } = await page.evaluate(() => ({
    title: document.getElementsByClassName('skinArticleTitle')[0].innerText,
    ps: [...document.getElementsByTagName('p')].map(p => p.innerText),
  }));
  const ptexts = ps.join('');
  const isNewTitle = checkNewTitle(title);
  const isNew = isNewTitle && ptexts.includes('');
  const fansignInfoRegex = new RegExp(
    Object.values(FANSIGN_INFOS)
      .reduce((regex, INFO) => regex + `(${INFO})|`, '')
      .slice(0, -1),
    'g',
  );

  const splitedTitle = title.split(/\s/g);
  const fansignTypeIndex = splitedTitle.findIndex(el => (isNewTitle ? checkNewTitle(el) : el.includes('!') || el.includes('！') || el.includes('サイン会')));
  const group = splitedTitle.slice(0, fansignTypeIndex).join(' ');
  const fansignTypeText = Object.keys(fansignTypes).reduce((acc, curr) => (splitedTitle[fansignTypeIndex].includes(curr) ? curr : acc), 'ヨントン');
  const rest = splitedTitle.slice(fansignTypeIndex + 1);

  const isSeasonsGreetings = title.includes('シーズン') || title.toUpperCase().includes('SEASON');
  const eventDateOfTitle = rest.filter(word => word.includes('/') && word.split('/').every(letter => !isNaN(Number(letter))))[0];
  const fansignType = fansignTypes[fansignTypeText];
  const fansignConfig =
    fansignTypeText === 'ビデオ' || fansignTypeText === '対面' || fansignTypeText === 'ヨントン'
      ? Object.entries(fansignConfigs).filter(([, words]) => words.some(word => title.includes(word)))[0]?.[0] || ''
      : '';

  const splitedPs = fullNumberToHalfNumber(ptexts).split(fansignInfoRegex).filter(Boolean);
  const innerTexts = Object.entries(FANSIGN_INFOS).reduce((texts, [info, infoText]) => {
    const infoIndex = splitedPs.findIndex(innerText => innerText.includes(infoText)) + 1;
    texts[info] = infoIndex ? splitedPs[infoIndex].trim().split(/◆|場所/g).filter(Boolean)[0].split('👉').filter(Boolean)[0].replace(/:|：/g, '') : '';

    return texts;
  }, {});
  innerTexts.eventDeadline = innerTexts.eventDeadline.split(/~|〜/g)[1];

  const [prices, agencyFees] = await page.evaluate(() =>
    [...document.querySelectorAll('[style*="color"]')]
      .map(el => el.innerText)
      .join('')
      .split('代行手数料')
      .map(text =>
        text.match(/([０-９]|[0-9])+円/g).map(price => price.replace('円', '').replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0))),
      ),
  );

  return {
    isNew,
    isSeasonsGreetings,
    eventDateOfTitle,
    group,
    fansignType,
    fansignConfig,
    prices,
    agencyFees,
    ...Object.entries(innerTexts).reduce((details, [info, dateString]) => {
      details[info] = dateStringToDate(dateString);

      return details;
    }, {}),
  };
};

const crawlFansignInfo = async url => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    return trimAllForObject(await crawl(page));
  } catch (err) {
    throw Error(err);
  } finally {
    await browser.close();
  }
};

module.exports = { crawlFansignInfo, isPrimitive, trimAll, trimAllForObject };
