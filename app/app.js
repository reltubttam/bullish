const Streamer = require('./services/streaming');
const logger = require('./lib/logger');
const { getFullMinuteOfTrade } = require('./services/minute-api');
const {
  increaseStreamVolume,
  getStreamVolume,
  setAPIVolume,
  logVolumeData,
} = require('./lib/record');

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
    const roundedUpTime = Math.ceil(payload.exchangeTimeStamp / 60) * 60;
    const totalVolme = increaseStreamVolume(roundedUpTime, payload.quantity);

    // if the current minute is starting AND the app has more than 1 minute with some data
    // we now can handle the completed minute
    if (totalVolme === payload.quantity && getStreamVolume(roundedUpTime - 120)) {
      const fullMinuteData = await getFullMinuteOfTrade(
        roundedUpTime - 60,
        payload.exchange,
        payload.fromSymbol,
        payload.toSymbol,
      );
      logger.debug({ fullMinuteData });

      setAPIVolume(roundedUpTime - 60, fullMinuteData.volumefrom);
      logVolumeData(roundedUpTime - 60);
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
