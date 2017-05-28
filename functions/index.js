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
 *
 * 2.
 * 於是會觸發 rechatRun 來接手
 * 會根據 vod 長度來切成數個 major segment
 * 擺進
 * `_running/{videoId}/{segmentNo}/{pushId}`
 * {
 *   videoId, start, end, actualEnd
 * }
 * 同時擺一個判斷最後處理用的資料在
 * `_finishedSegment/{videoId}`
 * {
 *   start,
 *   end,
 *   count: [已完成 segment 數],
 *   total: [總 segment 數]
 * }
 *
 *
 * 3.
 * 接著 rechatSegment 接手
 *
 * ## 下面同步對每個 segment 進行 ##
 *
 * 移除剛剛的 ref，儲存跑完的結果到暫存結果
 * `_results/{videoId}/{start}`
 * {
 *   [segment編號]: [segment內發言數],
 *   ...
 * }
 * 並且補上接下來的待跑 segment 到 `_running/{videoId}/{segmentNo}/{pushId}`
 *
 *
 * 4.
 * ## 下面同步對每個 segment 進行 ##
 *
 * 跑著跑著會發現有一天 end > actualEnd，表示已經跑完全部的 (sub) segment，
 * 也就是說這個 major segment 已經完成
 * 此時就需要更新
 * `_finishedSegment/{videoId}/count`
 * 把當前數值加 1
 *
 *
 * 5.
 * rechatFinish 不斷的監看著 `_finishedSegment/{videoId}`，
 * 直到 count == total 的那天
 *
 * 從 `_results/{videoId}` 取出所有的 chats
 * 將它們合併為一之後進行計數統計
 *
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
 *
 * 然後把上面暫存的東西清光光
 */

exports.rechatSegment = require('./rechatSegment')(admin);
exports.rechatRun = require('./rechatRun')(admin);
exports.rechatFinish = require('./rechatFinish')(admin);
exports.analyze = require('./analyze')(admin);
