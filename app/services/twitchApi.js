export const NAME = 'twitchApi';

/* @ngInject */
function factory($http, CONFIG) {
  const base = 'https://api.twitch.tv/kraken/';
  return function twitchApi(path) {
    const api = `${base}${path}`;
    return $http.get(api, {
      params: {
        client_id: CONFIG.twitch.clientId
      }
    });
  };
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
