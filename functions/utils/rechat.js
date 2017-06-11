const axios = require('axios');
const _ = require('lodash');


const one = (videoId, start) => {
  const url = `https://rechat.twitch.tv/rechat-messages?start=${start}&video_id=${videoId}`;
  return axios.get(url);
};

const loop = (videoId, start, end, maxCount = 0, progressFn) => {
  let aggChats = [];
  let count = 0;

  const _timeLimitFilter = (v) => {
    const timestamp = _.get(v, 'attributes.timestamp', null);
    if (
      timestamp === null ||
      Math.floor(timestamp / 1000) > end
    ) {
      return false;
    }
    return true;
  };

  const _loop = (v, s) => {
    if (s > end) {
      return Promise.resolve(aggChats);
    }
    if (count > maxCount && maxCount !== 0) {
      return Promise.resolve(aggChats);
    }
    count += 1;

    return one(v, s)
    .then((res) => {
      const data = res.data;
      const chats = data.data;

      const chunkTime = Math.max(((s - start) * 1000) % 3e4, 1000);

      let next;

      if (progressFn && typeof progressFn === 'function') {
        progressFn({
          response: res,
          videoId: v,
          start: s
        });
      }

      if (chats.length === 0) {
        next = s + Math.floor(chunkTime / 1000);
      }
      else {
        // 返回的 chat 時間可能已經超過 end
        // 必須過時間 filter
        aggChats = aggChats.concat(_.filter(chats, _timeLimitFilter));

        const last = chats[chats.length - 1];
        const lastTimestamp = _.get(last, 'attributes.timestamp', null);

        // 最後時間已經超過 end，可以直接結束
        if ((lastTimestamp / 1000) >= end) {
          return aggChats;
        }

        next = Math.ceil(lastTimestamp / 1000) + Math.floor(chunkTime / 1000);
        // 下一輪的開始最多就跟結束時間相同
        next = Math.min(next, end);
      }

      // 開始 = 結束時間，肯定是最後一輪
      if (s === end) {
        return aggChats;
      }

      return _loop(v, next);
    }, (err) => {
      // when bad things happened, we reject with response rather than aggChats
      return Promise.reject({
        error: err,
        chats: aggChats
      });
    });
  };

  return _loop(videoId, start)
  .then((rawChats) => {
    // 清除 id 相同的 chat
    return _.uniq(rawChats, 'id');
  });
};

module.exports = {
  one,
  loop
};
