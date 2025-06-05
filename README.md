# Bullish NodeJS Coding Task
this application collects trade data from the CoinDesk streaming service, then after each full minute since the epoch completes, compares this to the historical minute API end point.  Specifically we are concerned with trades for the pair BTC-USD for the exchange Coinbase.  The application has been built using NodeJS without typescript using mocha for testing.

## running the application
a `.env` file is required. The file `.env.example` can be copied, have a valid api key added to it and renamed for this purpose.  The following env vars are defined:
- `API_KEY` required for valid calls
- `LOG_LEVEL` *INFO* or *DEBUG* controls if extra data is written to the console
- `STREAMING_BASE_URL` location of the streaming service
- `MIN_API_BASE_URL` location of the minute api service

### starting the application
the following command will start the application, 
```
node .
```
it will indicate progress on the console and after each complete minute it will log the following.  Note that if `LOG_LEVEL=DEBUG` additionally it will output information about the data it is processing
```
INFO full minute completed {
  minuteTimeStamp: // unix timestamp in seconds marking the end of the minute
  humanReadableTime: // ISO format of minuteTimeStamp for human readability
  streamTotalVolume: // summation of all volumes seen via streaming
  apiTotalVolume: // total volume returned by the minute api
  difference: // streamTotalVolume - apiTotalVolume
  percentDifference: // difference expressed as a percentage of apiTotalVolume
}
```

### npm scripts
```
npm run test
```
this will run through the following in order, proceeding to the next only on a pass
1. mocha unit tests
2. lnting based on the airbnb style guide 
3. npm vulnerability audit

```
npm run test:lint -- --fix
```
this will resolve simple linting issues

## future developments
given more time I would have improved the following:
- better handling of historical data. E.g. if it is necessary to ammend a record after the minute elapses or if we have reason to replay the minute api call 
- improved error handling, e.g. we may be able to reconnect to the websocket or retry an http call
- allow better configuration of which trades are of interest 
