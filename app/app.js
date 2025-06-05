const Streamer = require('./services/streaming');
const logger = require('./lib/logger');
const { getFullMinuteOfTrade } = require('./services/minute-api');
const {
  increaseStreamVolume,
  getStreamVolume,
  setAPIVolume,
  logVolumeData,
} = require('./lib/record');

const MINUTE_IN_SECONDS = 60;
let streamer = null;

async function start() {
  logger.info('app starting');
  streamer = await Streamer.init();

  await streamer.subscribe({
    type: '0',
    exchange: 'Coinbase',
    fromSymbol: 'BTC',
    toSymbol: 'USD',
  }, async (payload) => {
    logger.progressDot();
    const roundedUpTime = Math.ceil(
      payload.exchangeTimeStamp / MINUTE_IN_SECONDS,
    ) * MINUTE_IN_SECONDS;
    const totalVolme = increaseStreamVolume(roundedUpTime, payload.volume);

    // if the current minute is starting AND the app has more than 1 minute with some data
    // we now can handle the completed minute
    if (totalVolme === payload.volume && getStreamVolume(roundedUpTime - 2 * MINUTE_IN_SECONDS)) {
      const fullMinuteData = await getFullMinuteOfTrade(
        roundedUpTime - MINUTE_IN_SECONDS,
        payload.exchange,
        payload.fromSymbol,
        payload.toSymbol,
      );

      setAPIVolume(roundedUpTime - MINUTE_IN_SECONDS, fullMinuteData.volumefrom);
      logVolumeData(roundedUpTime - MINUTE_IN_SECONDS);
    }
  });
  logger.info('app started');
}

async function stop() {
  logger.info('app stopping');
  if (streamer) {
    try {
      await streamer.close();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
  logger.info('app stopped');
}

module.exports = {
  start,
  stop,
};
