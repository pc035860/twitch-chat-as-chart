export const NAME = 'HomeCtrl';

const parseVideoId = (str) => {
  if (/twitch/.test(str)) {
    const m = str.match(/\/videos\/([0-9]+)/);
    if (m) {
      return m[1];
    }
    return null;
  }
  else if (/^[0-9]+$/.test(str)) {
    return str;
  }
  return null;
};

class HomeCtrl {
  __deps;

  vodInput;

  /* @ngInject */
  constructor(
    $log, $state, $timeout
  ) {
    this.__deps = { $log, $state };

    $timeout(() => {
      $('.r-home__input').focus();
    }, 100);
  }

  handleSubmit(val) {
    const { $state } = this.__deps;
    const videoId = parseVideoId(val);
    $state.go('vod', { videoId });
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, HomeCtrl);
}
