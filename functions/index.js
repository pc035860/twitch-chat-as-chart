const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

/**
 * 想像中的運作方式
 *
 * 1.
 * 開始查詢
 * `running/{videoId}`: true
 *
 * 2.
 * 於是會觸發 rechatRun 來接手
 * 擺上第一個待跑的 segment
 * `_running/{videoId}/{pushId}`
 * {
 *   videoId, start, end, actualEnd
 * }
 *
 * 3.
 * 接著 rechatSegment 接手
 * 移除剛剛的 ref，儲存跑完的結果到暫存結果
 * `_results/{videoId}/{start}`
 * {
 *   [segment編號]: [segment內發言數],
 *   ...
 * }
 * 並且補上接下來的待跑 segment 到 `_running/{videoId}/{pushId}`
 *
 * 4.
 * 跑著跑著會發現有一天 end > actualEnd，表示已經跑完全部的 segment
 * 從 `_results/{videoId}` 取出所有的暫存結果
 * {
 *   [segment start time]: {
 *     [segment編號]: [segment內發言數],
 *     ...
 *   },
 *   ...
 * }
 * 把裡面展開，如果碰到相同 segment 編號的結果就加起來
 * 接著找出最大 segment 編號，把中間所有空的 segment 全部補上 0
 * 最後把結果存到 `results/{videoId}`
 * {
 *   results: {
 *     [segment編號]: [segment內發言數],
 *     ...
 *   },
 *   meta: {
 *     start: [video 開始時間],
 *     end: [video 結束時間]
 *   }
 * }
 */

exports.rechatSegment = require('./rechatSegment')(admin);
exports.rechatRun = require('./rechatRun')(admin);

