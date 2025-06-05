const logger = require('./logger');

let volumeData = {};

function increaseStreamVolume(unixTimeStamp, volume) {
  if (volumeData[unixTimeStamp]) {
    volumeData[unixTimeStamp].streamTotalQuantity += volume;
  } else {
    volumeData[unixTimeStamp] = {
      streamTotalQuantity: volume,
    };
  }
  return volumeData[unixTimeStamp].streamTotalQuantity;
}

function getStreamVolume(unixTimeStamp) {
  return volumeData?.[unixTimeStamp]?.streamTotalQuantity;
}

function setAPIVolume(unixTimeStamp, volume) {
  if (!volumeData[unixTimeStamp]) {
    volumeData[unixTimeStamp] = {
      streamTotalQuantity: 0,
    };
  }
  volumeData[unixTimeStamp].apiTotalQuantity = volume;
}

function getAPIVolume(unixTimeStamp) {
  return volumeData?.[unixTimeStamp]?.apiTotalQuantity || 0;
}

function logVolumeData(unixTimeStamp) {
  const record = volumeData[unixTimeStamp] || {};
  const difference = (record.streamTotalQuantity || 0) - (record.apiTotalQuantity || 0);
  const percentDifference = `${((difference / (record.apiTotalQuantity || 1)) * 100).toFixed(2)}%`;
  logger.info('full minute completed', {
    minuteTimeStamp: unixTimeStamp,
    humanReadableTime: new Date(unixTimeStamp * 1000).toISOString(),

    streamTotalQuantity: record.streamTotalQuantity || 0,
    apiTotalQuantity: record.apiTotalQuantity || 0,
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
