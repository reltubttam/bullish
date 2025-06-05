const app = require('./app');

app.start();

process.on('SIGINT', async () => {
  try {
    await app.stop();
  } finally {
    process.exit(0);
  }
});
process.on('SIGTERM', async () => {
  try {
    await app.stop();
  } finally {
    process.exit(0);
  }
});
