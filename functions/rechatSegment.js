const functions = require('firebase-functions');

const rechat = require('./utils/rechat');
const _ = require('lodash');

const config = require('./config');

const perSegmentSeconds = config.perSegmentSeconds;

module.exports = function rechatSegment(admin) {
  return functions.database.ref('_running/{videoId}/{pushId}').onWrite((event) => {
    // 只在第一次建立時處理
    if (event.data.previous.exists()) {
      return undefined;
    }

    // 被清掉的時候不動作
    if (!event.data.exists()) {
      return undefined;
    }

    const { start, end, videoId, actualStart, actualEnd } = event.data.val();
    const isLastSeg = end === actualEnd;

    console.log('data', { start, end, videoId, actualStart, actualEnd });

    if (end > actualEnd) {
      // remove it
      event.data.ref.remove();

      /**
       * 處理最終資料
       */
      const db = admin.database();
      return db.ref(`_results/${videoId}`).once('value')
      .then((snapshot) => {
        const val = snapshot.val();

        const results = {};

        // 合併所有 segment count
        _.each(val, (localSegs) => {
          _.each(localSegs, (count, segKey) => {
            if (typeof results[segKey] === 'undefined') {
              results[segKey] = count;
            }
            else {
              results[segKey] += count;
            }
          });
        });


        // 儲存結果
        return db.ref(`results/${videoId}`).set({
          meta: {
            start: actualStart,
            end: actualEnd
          },
          results
        })
        .then(() => {
          // 刪除處理中 & 暫存
          return db.ref().update({
            running: {
              [videoId]: null
            },
            _results: {
              [videoId]: null
            }
          });
        })
        .then(() => true);
      });
    }

    /**
     * 處理本 segment
     */
    return rechat.loop(videoId, start, end)
    .then((chats) => {
      console.log('loop results', start, chats.length);

      const results = _.countBy(chats, (v) => {
        const t = parseInt(v.attributes.timestamp / 1000, 10);
        return t - actualStart;
      });

      const last = chats[chats.length - 1];
      const lastTimestamp = _.get(last, 'attributes.timestamp', null);

      const segStart = Math.ceil(lastTimestamp / 1000) + 1;
      const segEnd = isLastSeg ?
        actualEnd + 1 :  // just bigger than actualEnd will trigger dump results on next run
        Math.min(segStart + perSegmentSeconds, actualEnd);

      const db = admin.database();
      return db.ref(`_results/${videoId}/${start}`).set(results)
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
        return db.ref(`_running/${videoId}`).push({
          videoId,
          actualStart,
          actualEnd,
          start: segStart,
          end: segEnd
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
