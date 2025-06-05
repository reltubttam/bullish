const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();
const MOCK_CONFIG = {
  API_KEY: 'API_KEY',
  MIN_API_BASE_URL: 'MIN_API_BASE_URL',
};
const MOCK_LOGGER = {
  info: sandbox.fake(),
};

const {
  increaseStreamVolume,
  getStreamVolume,
  setAPIVolume,
  getAPIVolume,
  logVolumeData,
  clearVolumeData,
} = proxyquire('./record', {
  '../lib/config': MOCK_CONFIG,
  '../lib/logger': MOCK_LOGGER,
});

describe('increaseStreamVolume', () => {
  afterEach(() => {
    clearVolumeData();
    sandbox.reset();
  });
  it('sets initial stream volume', () => {
    const UNIX_TIME_STAMP = 1234567890;
    const VOLUME = 10;

    const result = increaseStreamVolume(UNIX_TIME_STAMP, VOLUME);
    expect(result).to.equal(VOLUME);
  });
  it('sums the stream volumes in 1 minute blocks', () => {
    const UNIX_TIME_STAMP = 1234567890;
    const FRST_VOLUME = 10;
    const SECOND_VOLUME = 20;

    const UNIX_TIME_STAMP_AFTER_MINUTE = UNIX_TIME_STAMP + 60;
    const VOLUME_AFTER_MINUTE = 40;

    expect(
      increaseStreamVolume(UNIX_TIME_STAMP, FRST_VOLUME),
    ).to.equal(FRST_VOLUME);

    expect(
      increaseStreamVolume(UNIX_TIME_STAMP, SECOND_VOLUME),
    ).to.equal(FRST_VOLUME + SECOND_VOLUME);

    expect(
      increaseStreamVolume(UNIX_TIME_STAMP_AFTER_MINUTE, VOLUME_AFTER_MINUTE),
    ).to.equal(VOLUME_AFTER_MINUTE);
  });
});

describe('getStreamVolume', () => {
  afterEach(() => {
    clearVolumeData();
    sandbox.reset();
  });
  it('returns stream volume for a time stamp', () => {
    const UNIX_TIME_STAMP = 1234567890;
    const VOLUME = 10;

    increaseStreamVolume(UNIX_TIME_STAMP, VOLUME);
    expect(
      getStreamVolume(UNIX_TIME_STAMP),
    ).to.equal(VOLUME);
  });
});

describe('setAPIVolume', () => {
  afterEach(() => {
    clearVolumeData();
    sandbox.reset();
  });
  it('sets API volume', () => {
    const UNIX_TIME_STAMP = 1234567890;
    const FRST_VOLUME = 10;
    const SECOND_VOLUME = 20;

    const UNIX_TIME_STAMP_AFTER_MINUTE = UNIX_TIME_STAMP + 60;
    const VOLUME_AFTER_MINUTE = 40;

    setAPIVolume(UNIX_TIME_STAMP, FRST_VOLUME);
    expect(
      getAPIVolume(UNIX_TIME_STAMP),
    ).to.equal(FRST_VOLUME);

    setAPIVolume(UNIX_TIME_STAMP, SECOND_VOLUME);
    expect(
      getAPIVolume(UNIX_TIME_STAMP),
    ).to.equal(SECOND_VOLUME);

    setAPIVolume(UNIX_TIME_STAMP_AFTER_MINUTE, VOLUME_AFTER_MINUTE);
    expect(
      getAPIVolume(UNIX_TIME_STAMP_AFTER_MINUTE),
    ).to.equal(VOLUME_AFTER_MINUTE);
    expect(
      getAPIVolume(UNIX_TIME_STAMP),
    ).to.equal(SECOND_VOLUME);
  });
});

describe('logVolumeData', () => {
  afterEach(() => {
    clearVolumeData();
    sandbox.reset();
  });
  it('logs the volume data', () => {
    const UNIX_TIME_STAMP = 1234567890;
    const STREAM_VOLUME = 11;
    const API_VOLUME = 10;

    increaseStreamVolume(UNIX_TIME_STAMP, STREAM_VOLUME);
    setAPIVolume(UNIX_TIME_STAMP, API_VOLUME);

    logVolumeData(UNIX_TIME_STAMP);

    expect(
      MOCK_LOGGER.info.getCalls().map(({ args }) => args),
    ).to.deep.equal([[
      'full minute completed',
      {
        minuteTimeStamp: UNIX_TIME_STAMP,
        humanReadableTime: new Date(UNIX_TIME_STAMP * 1000).toISOString(),
        streamTotalQuantity: STREAM_VOLUME,
        apiTotalQuantity: API_VOLUME,
        difference: STREAM_VOLUME - API_VOLUME,
        percentDifference: '10.00%',
      },
    ]]);
  });
});
