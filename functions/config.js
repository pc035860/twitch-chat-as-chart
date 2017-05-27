const functions = require('firebase-functions');

module.exports = {
  twitchClientId: process.env.TWITCH_CLIENT_ID || functions.config().twitch.clientid,
  perSegmentSeconds: 500,
  statisticalSegment: 10
};
