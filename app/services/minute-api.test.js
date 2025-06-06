const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();
const MOCK_CONFIG = {
  API_KEY: 'API_KEY',
  MIN_API_BASE_URL: 'MIN_API_BASE_URL',
};
const MOCK_LOGGER = {
  debug: sandbox.fake(),
};

const { getFullMinuteOfTrade } = proxyquire('./minute-api', {
  '../lib/config': MOCK_CONFIG,
  '../lib/logger': MOCK_LOGGER,
});

describe('minuteApi.getFullMinuteOfTrade', () => {
  const realFetch = fetch;
  const API_RESPONSE = {
    Data: {
      Data: [{
        volumefrom: 123.45,
      }],
    },
  };
  const MOCK_FETCH_RESPONSE = {
    status: 200,
    ok: true,
    json: sandbox.fake.resolves(API_RESPONSE),
  };

  beforeEach(() => {
    fetch = sandbox.fake.resolves(MOCK_FETCH_RESPONSE);
    MOCK_FETCH_RESPONSE.json = sandbox.fake.resolves(API_RESPONSE);
  });

  afterEach(() => {
    fetch = realFetch;
    sandbox.reset();
  });

  it('should make a call using fetch', async () => {
    const UNIX_TIME_STAMP = 1234567890;
    const EXCHANGE = 'EXCHANGE';
    const FROM_SYMBOL = 'FROM_SYMBOL';
    const TO_SYMBOL = 'TO_SYMBOL';

    const result = await getFullMinuteOfTrade(UNIX_TIME_STAMP, EXCHANGE, FROM_SYMBOL, TO_SYMBOL);
    expect(result).to.equal(API_RESPONSE.Data.Data[0]);
    expect(
      MOCK_LOGGER.debug.getCalls().map(({ args }) => args),
    ).to.deep.equal(
      [['minute api payload:', { data: JSON.stringify(API_RESPONSE), toTimeStamp: UNIX_TIME_STAMP }]],
    );
    expect(fetch.getCalls().map(({ args }) => args)).to.deep.equal([[
      `${MOCK_CONFIG.MIN_API_BASE_URL}/histominute?fsym=${FROM_SYMBOL}&tsym=${TO_SYMBOL}&e=${EXCHANGE}&toTs=${UNIX_TIME_STAMP}&limit=1&extraParams=streamApiCompare`,
      {
        headers: {
          api_key: MOCK_CONFIG.API_KEY,
        },
      },
    ]]);
  });
});
