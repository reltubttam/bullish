const Streamer = require('./services/streaming');
const logger = require('./lib/logger');
const { getFullMinuteOfTrade } = require('./services/minute-api');


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
    console.log({ payload });
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
