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


    if (end > actualEnd) {
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

        // 把空白 segment 補上 index 跟 0
        const max = _.max(Object.keys(results));
        for (let i = 0; i < max; i += 1) {
          if (typeof results[`${i}`] === 'undefined') {
            results[`${i}`] = 0;
          }
        }

        // 儲存結果
        return db.ref(`results/${videoId}`).set({
          meta: {
            start: actualStart,
            end: actualEnd
          },
          results,
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
        });
      });
    }

    /**
     * 處理本 segment
     */
    return rechat.loop(videoId, start, end)
    .then((chats) => {
      const results = _.countBy(chats, (v) => {
        const t = parseInt(v.attributes.timestamp / 1000, 10);
        return t - actualStart;
      });

      const last = chats[chats.length - 1];
      const lastTimestamp = _.get(last, 'attributes.timestamp', null);

      const segStart = lastTimestamp + 1;
      const segEnd = segStart + perSegmentSeconds;

      const db = admin.database();
      return db.ref(`_results/${videoId}/${start}`).set(results)
      .then(() => {
        return event.data.ref.once('value')
        .then(snapshot => snapshot.exists());
      })
      .then((refStillExists) => {
        if (!refStillExists) {
          // don't continue if the ref somehow gets removed
          return null;
        }

        // remove it
        const p1 = event.data.ref.remove();

        // add next
        const p2 = db.ref(`_running/${videoId}`).push({
          videoId,
          actualStart,
          actualEnd,
          start: segStart,
          end: segEnd
        });

        return Promise.all([p1, p2]);
      });
    });
  });
};
