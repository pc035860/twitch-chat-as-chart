const _ = require('lodash');
const createTwitch = require('../utils/twitchApi').create;
const rechat = require('../utils/rechat');

const config = require('../config');

const twitch = createTwitch(config.twitchClientId);

console.time('fullrun');

twitch('videos/144766044').then((res) => {
  // console.log('video response', res.data);

  const videoId = res.data._id;
  const start = parseInt(+new Date(res.data.created_at) / 1000, 10);
  const end = start + Number(res.data.length);

  console.log('[video]', videoId, start, end, res.data);

  return rechat.loop(videoId, start, end, 0, (o) => {
    console.log('[progress]', o.start - start, o.response.data.data.length);
  })
  .then((chats) => {
    const perChunk = 10;
    const results = _.countBy(chats, (v) => {
      const t = parseInt(v.attributes.timestamp / 1000, 10);
      const chunkIndex = Math.floor((t - start) / perChunk);
      return chunkIndex;
    });
    console.log(results);

    console.timeEnd('fullrun');
  });
});
