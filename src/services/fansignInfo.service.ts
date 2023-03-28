import { useCrawlFansignInfo } from '../utils/puppeteer';

const getFansignInfo = async (url: string) => {
  try {
    return await useCrawlFansignInfo(url);
  } catch (error) {
    throw Error(String(error));
  }
};

export default {
  getFansignInfo,
};
