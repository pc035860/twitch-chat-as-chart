const functions = require('firebase-functions');

const createTwitch = require('./utils/twitchApi').create;
const vodId = require('./utils/vodId');
const Lazy = require('lazy.js');

const config = require('./config');

const twitch = createTwitch(config.twitchClientId);

const segmentSeconds = config.segmentSeconds;

const createMajorSegments = (videoId, start, end) => {
  const seconds = segmentSeconds.major;
  const count = Math.ceil((end - start) / seconds);

  return Lazy.range(count).map((i) => {
    const actualStart = start + (i * seconds);
    const actualEnd = i === count - 1 ?
      end :
      actualStart + seconds;

    return {
      videoId,
      actualStart,
      actualEnd,
      start: actualStart,
      end: actualStart + segmentSeconds.sub,
      segmentCount: count
    };
  }).toArray();
};

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
      const start = parseInt(+new Date(res.data.recorded_at) / 1000, 10);
      const end = start + Number(res.data.length);

      const db = admin.database();
      const runningRef = db.ref(`_running/${videoId}`);

      const majorSegs = createMajorSegments(videoId, start, end);
      const promises = majorSegs.map((seg, i) => {
        return runningRef.child(i).push(seg).then(() => true);
      });

      promises.push(
        db.ref(`_finishedSegment/${videoId}`).set({
          start,
          end,
          count: 0,
          total: majorSegs[0].segmentCount
        })
      );

      return Promise.all(promises);
    })
    .then(() => true)
    .catch((e) => {
      console.error(e);
    });
  });
};
