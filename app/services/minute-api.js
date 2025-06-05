const { API_KEY, MIN_API_BASE_URL } = require('../lib/config');
const logger = require('../lib/logger');

async function getFullMinuteOfTrade(
  toTimeStamp,
  exchange,
  fromSymbol,
  toSymbol,
) {
  const response = await fetch(`${
    MIN_API_BASE_URL
  }/histominute?fsym=${
    fromSymbol
  }&tsym=${
    toSymbol
  }&e=${
    exchange
  }&limit=1&extraParams=streamApiCompare&toTs=${
    toTimeStamp
  }`, {
    headers: {
      api_key: API_KEY,
    },
  });
  if (!response.ok) {
    throw new Error(`response code ${response.status} recieved`);
  }
  const data = await response.json();
  logger.debug('minute api payload:', {
    toTimeStamp,
    data: JSON.stringify(data),
  });
  if (!data?.Data?.Data?.[0]) {
    throw new Error('malformed response recieved', JSON.stringify(data, null, 2));
  }
  return data.Data.Data[0];
}

module.exports = {
  getFullMinuteOfTrade,
};
