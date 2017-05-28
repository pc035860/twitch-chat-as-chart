const functions = require('firebase-functions');

module.exports = {
  twitchClientId: process.env.TWITCH_CLIENT_ID || functions.config().twitch.clientid,
  segmentSeconds: {
    sub: 500,
    major: 500 * 3
  }
};
