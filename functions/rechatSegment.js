const functions = require('firebase-functions');

const rechat = require('./utils/rechat');
const _ = require('lodash');

const config = require('./config');

const segNum = config.statisticalSegment;
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

    // remove it
    event.data.ref.remove();

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
          // 刪除暫存
          return db.ref(`_results/${videoId}`).remove();
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
        return db.ref(`_running/${videoId}`).push({
          videoId,
          actualStart,
          actualEnd,
          start: segStart,
          end: segEnd
        });
      });
    });
  });
};
