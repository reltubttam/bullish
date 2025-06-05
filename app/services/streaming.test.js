const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();
const MOCK_CONFIG = {
  API_KEY: 'API_KEY',
  STREAMING_BASE_URL: 'STREAMING_BASE_URL',
};
const MOCK_LOGGER = {
  debug: sandbox.fake(),
};
const MOCK_WS = {
  on: sandbox.fake(),
  send: sandbox.fake(),
  close: sandbox.fake(),
};
const MOCK_WS_CLASS = sandbox.fake.returns(MOCK_WS);

const Streamer = proxyquire('./streaming', {
  '../lib/config': MOCK_CONFIG,
  '../lib/logger': MOCK_LOGGER,
  ws: MOCK_WS_CLASS,
});

describe('init', () => {
  afterEach(() => {
    sandbox.reset();
  });
  it('should set the streamer to recieve messages', async () => {
    MOCK_WS.on = sandbox.fake((event, cb) => {
      if (event === 'open') {
        return cb();
      }
      return null; // callback for message handled explicitly later
    });
    const streamer = await Streamer.init();

    expect(MOCK_WS_CLASS.getCalls().map(({ args }) => args)).to.deep.equal([[
      MOCK_CONFIG.STREAMING_BASE_URL,
      {
        headers: {
          authorization: `Apikey ${MOCK_CONFIG.API_KEY}`,
        },
      },
    ]]);
    expect(Object.keys(streamer)).to.deep.equal(['subscribe', 'close']);
    expect(MOCK_WS.on.getCalls().map(({ args }) => args)[0][0]).to.equal('message');
    expect(MOCK_WS.on.getCalls().map(({ args }) => args)[1][0]).to.equal('open');

    const messageHandler = MOCK_WS.on.getCalls()[0].args[1];
    const MESSAGE = {
      TYPE: 'TYPE',
      M: 'M',
      FSYM: 'FSYM',
      TSYM: 'TSYM',
      TS: 'TS',
      RTS: 'RTS',
      P: 'P',
      Q: 'Q',
      TOTAL: 'TOTAL',
    };
    messageHandler({ toString: () => JSON.stringify(MESSAGE) });
    expect(MOCK_LOGGER.debug.getCalls().map(({ args }) => args)).to.deep.equal([[
      'streaming payload:', MESSAGE,
    ]]);
  });
  it('should reject on open errors', async () => {
    const OPEN_ERROR = new Error('OPEN_ERROR');
    MOCK_WS.on = sandbox.fake((event, cb) => {
      if (event === 'open') {
        return cb(OPEN_ERROR);
      }
      return null; // callback for message handled explicitly later
    });
    try {
      await Streamer.init();
      throw new Error('should throw');
    } catch (err) {
      expect(err).to.equal(OPEN_ERROR);
    }

    expect(MOCK_WS_CLASS.getCalls().map(({ args }) => args)).to.deep.equal([[
      MOCK_CONFIG.STREAMING_BASE_URL,
      {
        headers: {
          authorization: `Apikey ${MOCK_CONFIG.API_KEY}`,
        },
      },
    ]]);
    expect(MOCK_WS.on.getCalls().map(({ args }) => args)[0][0]).to.equal('message');
    expect(MOCK_WS.on.getCalls().map(({ args }) => args)[1][0]).to.equal('open');
  });
});

describe('subscribe', () => {
  afterEach(() => {
    sandbox.reset();
  });
  it('should recieve relevant trades', async () => {
    MOCK_WS.on = sandbox.fake((event, cb) => {
      if (event === 'open') {
        return cb();
      }
      return null; // callback for message handled explicitly later
    });
    const streamer = await Streamer.init();

    const DETAILS = {
      type: 'TYPE',
      exchange: 'EXCHANGE',
      fromSymbol: 'FROM_SYMBOL',
      toSymbol: 'TO_SYMBOL',
    };
    const SUBSCRIPTION_HANDLER = sandbox.fake();
    streamer.subscribe(DETAILS, SUBSCRIPTION_HANDLER);

    const messageHandler = MOCK_WS.on.getCalls()[0].args[1];
    const MESSAGE = {
      TYPE: DETAILS.type,
      M: DETAILS.exchange,
      FSYM: DETAILS.fromSymbol,
      TSYM: DETAILS.toSymbol,
      TS: 'TS',
      RTS: 'RTS',
      P: 'P',
      Q: 'Q',
      TOTAL: 'TOTAL',
    };
    messageHandler({ toString: () => JSON.stringify(MESSAGE) });
    expect(MOCK_LOGGER.debug.getCalls().map(({ args }) => args)).to.deep.equal([[
      'streaming payload:', MESSAGE,
    ]]);
    expect(SUBSCRIPTION_HANDLER.getCalls().map(({ args }) => args)).to.deep.equal([[{
      type: MESSAGE.TYPE,
      exchange: MESSAGE.M,
      fromSymbol: MESSAGE.FSYM,
      toSymbol: MESSAGE.TSYM,
      exchangeTimeStamp: MESSAGE.TS,
      recievedTimeStamp: MESSAGE.RTS,
      price: MESSAGE.P,
      quantity: MESSAGE.Q,
      total: MESSAGE.TOTAL,
    }]]);
  });
  it('should not recieve other messages', async () => {
    MOCK_WS.on = sandbox.fake((event, cb) => {
      if (event === 'open') {
        return cb();
      }
      return null; // callback for message handled explicitly later
    });
    const streamer = await Streamer.init();

    const DETAILS = {
      type: 'OTHER_TYPE',
      exchange: 'OTHER_EXCHANGE',
      fromSymbol: 'OTHER_FROM_SYMBOL',
      toSymbol: 'OTHER_TO_SYMBOL',
    };
    const SUBSCRIPTION_HANDLER = sandbox.fake();
    streamer.subscribe(DETAILS, SUBSCRIPTION_HANDLER);

    const messageHandler = MOCK_WS.on.getCalls()[0].args[1];
    const MESSAGE = {
      TYPE: 'TYPE',
      M: 'EXCHANGE',
      FSYM: 'FROM_SYMBOL',
      TSYM: 'TO_SYMBOL',
      TS: 'TS',
      RTS: 'RTS',
      P: 'P',
      Q: 'Q',
      TOTAL: 'TOTAL',
    };
    messageHandler({ toString: () => JSON.stringify(MESSAGE) });
    expect(MOCK_LOGGER.debug.getCalls().map(({ args }) => args)).to.deep.equal([[
      'streaming payload:', MESSAGE,
    ]]);
    expect(SUBSCRIPTION_HANDLER.getCalls().map(({ args }) => args)).to.deep.equal([]);
  });
});

describe('close', () => {
  afterEach(() => {
    sandbox.reset();
  });
  it('should close the websocket', async () => {
    const MESSAGE = {
      TYPE: 'TYPE',
      M: 'EXCHANGE',
      FSYM: 'FROM_SYMBOL',
      TSYM: 'TO_SYMBOL',
      TS: 'TS',
      RTS: 'RTS',
      P: 'P',
      Q: 'Q',
      TOTAL: 'TOTAL',
    };
    MOCK_WS.on = sandbox.fake((event, cb) => {
      if (event === 'open') {
        return cb();
      }
      return cb({ toString: () => JSON.stringify(MESSAGE) });
    });
    const streamer = await Streamer.init();

    MOCK_WS.send = sandbox.fake((data, cb) => cb());
    await streamer.close();
    expect(MOCK_WS.close.getCalls().map(({ args }) => args)).to.deep.equal([
      [],
    ]);
  });
});
