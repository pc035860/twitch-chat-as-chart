const axios = require('axios');
const _ = require('lodash');

const _create = (version = 5, clientId, token) => {
  let headers = {
    Accept: 'application/vnd.twitchtv.v3+json',
    Authorization: `OAuth ${token}`
  };
  if (!token) {
    headers = _.omit(headers, ['Authorization']);
  }
  return axios.create({
    baseURL: 'https://api.twitch.tv/kraken/',
    timeout: 2000,
    headers,
    params: {
      client_id: clientId
    }
  });
};

const createV3 = (clientId, token) => {
  return _create(3, clientId, token);
};
const createV5 = (clientId, token) => {
  return _create(5, clientId, token);
};

module.exports = {
  createV3,
  createV5,
  create: createV5
};
