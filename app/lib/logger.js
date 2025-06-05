const { LOG_LEVEL } = require('./config');

let progressDotsInProgress = false;

function info(...args) {
  if (LOG_LEVEL === 'INFO' || LOG_LEVEL === 'DEBUG') {
    if (progressDotsInProgress) {
      process.stdout.write('\n');
      progressDotsInProgress = false;
    }
    // eslint-disable-next-line no-console
    console.log('INFO', ...args);
  }
}

function error(...args) {
  if (LOG_LEVEL === 'INFO' || LOG_LEVEL === 'DEBUG') {
    if (progressDotsInProgress) {
      process.stdout.write('\n');
      progressDotsInProgress = false;
    }
    // eslint-disable-next-line no-console
    console.error('ERROR', ...args);
  }
}

function debug(...args) {
  if (LOG_LEVEL === 'DEBUG') {
    if (progressDotsInProgress) {
      process.stdout.write('\n');
      progressDotsInProgress = false;
    }
    // eslint-disable-next-line no-console
    console.log('DEBUG', ...args);
  }
}

function progressDot() {
  process.stdout.write('.');
  progressDotsInProgress = true;
}

module.exports = {
  info,
  error,
  debug,
  progressDot,
};
