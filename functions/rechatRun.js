const functions = require('firebase-functions');

const createTwitch = require('./utils/twitchApi').create;
const vodId = require('./utils/vodId');

const config = require('./config');

const twitch = createTwitch(config.twitchClientId);

const perSegmentSeconds = config.perSegmentSeconds;

module.exports = function rechatRun(admin) {
  return functions.database.ref('running/{videoId}').onWrite((event) => {
    // 只在第一次建立
    if (event.data.previous.exists()) {
      return undefined;
    }

    // 被清掉的時候不動作
    if (!event.data.exists()) {
      return undefined;
    }

    const videoId = vodId.format(event.params.videoId);

    console.log('video id', videoId, vodId.strip(videoId));

    return twitch(`videos/${vodId.strip(videoId)}`)
    .then((res) => {
      const start = parseInt(+new Date(res.data.created_at) / 1000, 10);
      const end = start + Number(res.data.length);

      const segStart = start;
      const segEnd = start + perSegmentSeconds;

      const db = admin.database();
      const ref = db.ref(`_running/${videoId}`);

      console.log('push', videoId, start);

      return ref.push({
        videoId,
        start: segStart,
        end: segEnd,
        actualStart: start,
        actualEnd: end
      });
    })
    .then(() => true)
    .catch((e) => {
      console.error(e);
    });
  });
};
