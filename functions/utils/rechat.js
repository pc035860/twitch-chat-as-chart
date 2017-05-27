const axios = require('axios');
const _ = require('lodash');


const one = (videoId, start) => {
  const url = `https://rechat.twitch.tv/rechat-messages?start=${start}&video_id=${videoId}`;
  return axios.get(url);
};

const loop = (videoId, start, end, maxCount = 0, progressFn) => {
  let aggChats = [];
  let count = 0;

  const _loop = (v, s, e) => {
    if (s >= e) {
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
        aggChats = aggChats.concat(chats);

        const last = chats[chats.length - 1];
        const lastTimestamp = _.get(last, 'attributes.timestamp', null);

        next = Math.ceil(lastTimestamp / 1000) + Math.floor(chunkTime / 1000);
      }

      return _loop(v, next, e);
    });
  };

  return _loop(videoId, start, end);
};

module.exports = {
  one,
  loop
};
