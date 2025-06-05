require('dotenv').config();

module.exports = {
  API_KEY: process.env.API_KEY || 'no api key',
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
  STREAMING_BASE_URL: 'wss://streamer.cryptocompare.com/v2',
  MIN_API_BASE_URL: 'https://min-api.cryptocompare.com/data/v2',
};
