const logger = require('./logger');

let volumeData = {};

function increaseStreamVolume(unixTimeStamp, volume) {
  if (volumeData[unixTimeStamp]) {
    volumeData[unixTimeStamp].streamTotalVolume += volume;
  } else {
    volumeData[unixTimeStamp] = {
      streamTotalVolume: volume,
    };
  }
  return volumeData[unixTimeStamp].streamTotalVolume;
}

function getStreamVolume(unixTimeStamp) {
  return volumeData?.[unixTimeStamp]?.streamTotalVolume;
}

function setAPIVolume(unixTimeStamp, volume) {
  if (!volumeData[unixTimeStamp]) {
    volumeData[unixTimeStamp] = {
      streamTotalVolume: 0,
    };
  }
  volumeData[unixTimeStamp].apiTotalVolume = volume;
}

function getAPIVolume(unixTimeStamp) {
  return volumeData?.[unixTimeStamp]?.apiTotalVolume || 0;
}

function logVolumeData(unixTimeStamp) {
  const record = volumeData[unixTimeStamp] || {};
  const difference = (record.streamTotalVolume || 0) - (record.apiTotalVolume || 0);
  const percentDifference = `${((difference / (record.apiTotalVolume || 1)) * 100).toFixed(2)}%`;
  logger.info('full minute completed', {
    minuteTimeStamp: unixTimeStamp,
    humanReadableTime: new Date(unixTimeStamp * 1000).toISOString(),

    streamTotalVolume: record.streamTotalVolume || 0,
    apiTotalVolume: record.apiTotalVolume || 0,
    difference,
    percentDifference,
  });
}

// for testing purposes
function clearVolumeData() {
  volumeData = {};
}

module.exports = {
  increaseStreamVolume,
  getStreamVolume,
  setAPIVolume,
  logVolumeData,
  clearVolumeData,
  getAPIVolume,
};
