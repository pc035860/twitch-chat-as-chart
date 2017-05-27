/**
 * 去掉 vod id 裡的 "v"
 * @param  {string} vodId vod id
 * @return {string}       純數字 vod id
 */
const strip = (vodId) => {
  return vodId.replace(/v/g, '');
};

/**
 * 確保 vod id 是正規格式
 * @param  {string} vodId vod id (with "v" or not)
 * @return {string}       正統 vod id (當然有 "v")
 */
const format = (vodId) => {
  return `v${strip(vodId)}`;
};

module.exports = {
  strip,
  format
};
