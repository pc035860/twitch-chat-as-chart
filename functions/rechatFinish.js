const functions = require('firebase-functions');
const Lazy = require('lazy.js');

module.exports = function rechatFinish(admin) {
  return functions.database.ref('_finishedSegment/{videoId}').onWrite((event) => {
    // 被清掉的時候不動作
    if (!event.data.exists()) {
      return undefined;
    }

    const { count, total, start, end } = event.data.val();

    console.log('[finish]', count, total);

    if (count < total) {
      return undefined;
    }

    const videoId = event.params.videoId;
    const db = admin.database();

    const finalize = () => {
      // 刪除 finished segment
      const p1 = event.data.ref.remove();

      // 刪除處理中 & 暫存
      const p2 = db.ref().update({
        running: {
          [videoId]: null
        },
        _results: {
          [videoId]: null
        }
      });

      return Promise.all([p1, p2]).then(() => true);
    };

    /**
     * 處理最終資料
     */
    return db.ref(`_results/${videoId}`).once('value')
    .then((snapshot) => {
      const val = snapshot.val();

      const lazyVal = Lazy(val);

      const errorCount = lazyVal
      .filter(v => (!Array.isArray(v) && v.error))
      .size();

      if (errorCount === lazyVal.size()) {
        return db.ref(`results/${videoId}`).set({
          meta: { start, end },
          error: 'Not available'
        });
      }

      const results = lazyVal
      .reduce((agg, v) => {
        if (!Array.isArray(v)) {
          // do nothing with non-array
          return agg;
        }
        return agg.concat(v);
      }, Lazy([]))
      .uniq('id')
      .countBy((v) => {
        const t = parseInt(v.attributes.timestamp / 1000, 10);
        return t - start;
      })
      .toObject();

      // 儲存結果
      return db.ref(`results/${videoId}`).set({
        meta: { start, end },
        results
      });
    })
    .then(() => finalize());
  });
};
