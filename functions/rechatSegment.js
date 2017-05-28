const functions = require('firebase-functions');

const rechat = require('./utils/rechat');
const _ = require('lodash');
const Lazy = require('lazy.js');

const config = require('./config');

const segmentSeconds = config.segmentSeconds;

module.exports = function rechatSegment(admin) {
  return functions.database.ref('_running/{videoId}/{segNo}/{pushId}').onWrite((event) => {
    // 只在第一次建立時處理
    if (event.data.previous.exists()) {
      return undefined;
    }

    // 被清掉的時候不動作
    if (!event.data.exists()) {
      return undefined;
    }

    const segNo = event.params.segNo;
    const { start, end, videoId, actualStart, actualEnd, segmentCount } = event.data.val();
    const isLastSeg = end === actualEnd;

    const db = admin.database();

    console.log('data', { start, end, videoId, actualStart, actualEnd, segmentCount });

    if (end > actualEnd) {
      // remove it
      const p1 = event.data.ref.remove();

      // add finished segment
      const p2 = db.ref(`_finishedSegment/${videoId}/count`).transaction((val) => {
        if (val === null) {
          return 1;
        }
        return val + 1;
      })
      .then(({ commited }) => commited);

      return Promise.all([p1, p2]);
    }

    /**
     * 處理本 segment
     */
    return rechat.loop(videoId, start, end)
    .then((chats) => {
      console.log('loop results', start, chats.length);

      const last = chats[chats.length - 1];
      const lastTimestamp = _.get(last, 'attributes.timestamp', null);

      const segStart = Math.ceil(lastTimestamp / 1000) + 1;
      const segEnd = isLastSeg ?
        actualEnd + 1 :  // just bigger than actualEnd will trigger dump results on next run
        Math.min(segStart + segmentSeconds.sub, actualEnd);

      return db.ref(`_results/${videoId}/${start}`).set(chats)
      .then(() => {
        console.log('loop results set', start);
        return event.data.ref.once('value')
        .then(snapshot => snapshot.exists());
      })
      .then((refStillExists) => {
        console.log('ref exists', refStillExists);

        if (!refStillExists) {
          // don't continue if the ref somehow gets removed
          return null;
        }

        // remove it
        event.data.ref.remove();

        // add next
        return db.ref(`_running/${videoId}/${segNo}`).push({
          videoId,
          actualStart,
          actualEnd,
          start: segStart,
          end: segEnd,
          segmentCount
        })
        .then(() => {
          console.log('next added');
        });
      })
      .then(() => true)
      .catch((e) => {
        console.error(e);
      });
    });
  });
};
