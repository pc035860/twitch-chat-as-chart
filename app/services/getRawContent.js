export const NAME = 'getRawContent';

/* @ngInject */
function factory($http) {
  const mainApiRoot = 'https://pc035860.parrottalks.com/api';

  return function getRawContent(href) {
    const params = {
      href, ua: navigator.userAgent
    };
    const api = `${mainApiRoot}/proxy`;
    return $http.get(api, { params });
  };
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
