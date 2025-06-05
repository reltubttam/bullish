const WebSocket = require('ws');
const logger = require('../lib/logger');
const { STREAMING_BASE_URL, API_KEY } = require('../lib/config');

async function init() {
  const handlers = {};
  function detailsToSub(details) {
    return `${details.type}~${details.exchange}~${details.fromSymbol}~${details.toSymbol}`;
  }

  const ws = new WebSocket(STREAMING_BASE_URL, {
    headers: {
      authorization: `Apikey ${API_KEY}`,
    },
  });

  ws.on('message', (data) => {
    const payload = JSON.parse(data.toString());
    logger.debug('streaming payload:', {
      exchangeTimeStamp: payload.TS,
      data: JSON.stringify(payload),
    });
    const parsedPayload = {
      type: payload.TYPE,
      exchange: payload.M,
      fromSymbol: payload.FSYM,
      toSymbol: payload.TSYM,

      exchangeTimeStamp: payload.TS,
      recievedTimeStamp: payload.RTS,

      price: payload.P,
      volume: payload.Q,
      total: payload.TOTAL,
    };
    const sub = detailsToSub(parsedPayload);
    if (handlers[sub]) {
      handlers[sub](parsedPayload);
    }
  });

  async function subscribe(details, handler) {
    const sub = detailsToSub(details);
    handlers[sub] = handler;
    const request = {
      action: 'SubAdd',
      subs: [sub],
    };
    return new Promise((resolve, reject) => {
      ws.send(JSON.stringify(request), (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  async function close() {
    const request = {
      action: 'SubRemove',
      subs: Object.keys(handlers),
    };
    return new Promise((resolve, reject) => {
      ws.send(JSON.stringify(request), (err) => {
        if (err) {
          return reject(err);
        }
        ws.close();
        return resolve();
      });
    });
  }

  return new Promise((resolve, reject) => {
    ws.on('open', (err) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        subscribe,
        close,
      });
    });
  });
}

module.exports = {
  init,
};
