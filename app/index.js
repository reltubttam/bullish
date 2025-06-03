require('dotenv').config();
const WebSocket = require('ws');

const totalTrades = 0;

const subs = ['0~Coinbase~BTC~USD'];
const ws = new WebSocket('wss://streamer.cryptocompare.com/v2', {
  headers: {
    authorization: `Apikey ${process.env.API_KEY}`,
  },
});
ws.on('open', () => {
  console.log('WebSocket open');
  const request = {
    action: 'SubAdd',
    subs,
  };
  ws.send(JSON.stringify(request), (err) => {
    if (err) {
      console.error('SubAdd error:', err);
    } else {
      console.log('SubAdd success');
    }
  });
});
ws.on('message', (data) => {
  const payload = JSON.parse(data.toString());
  console.log('Received:', payload);
  if (payload.TYPE === '0') {
    console.log(new Date(payload.RTS), payload.Q);
  }
});
ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});
ws.on('close', () => {
  console.log('WebSocket close');
});

function gracefulShutdown(signal) {
  console.log(`Received ${signal}`);
  const request = {
    action: 'SubRemove',
    subs,
  };
  ws.send(JSON.stringify(request), (err) => {
    if (err) {
      console.error('SubRemove error:', err);
    } else {
      console.log('SubRemove success');
    }

    ws.close();
    process.exit(0);
  });
}
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

async function getFullMinuteOfTrade() {
  const now = Math.floor(Date.now() / 1000);
  const startOfMinute = now - (now % 60);
  const response = await fetch(`https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=USD&limit=1&e=Coinbase&toTs=${startOfMinute}`, {
    headers: {
      api_key: process.env.API_KEY,
    },
  });
  console.log(response.status);
  const data = await response.json();
  console.log({ startOfMinute, data: JSON.stringify(data, null, 2) });
}

getFullMinuteOfTrade();
