import firebase from 'firebase';
import raf from 'raf';

export const NAME = 'VodCtrl';

// key: VodCtrl.timeGroup
const KEY_TIME_GROUP = 'e19f9459dba5aaae1577da23ad1b28a9';

class VodCtrl {
  __deps;

  videoId;
  videoData;
  data;
  timeGroup = window.localStorage[KEY_TIME_GROUP] || 'auto';

  indicator = {
    current: -1,
    mouse: -1,
    showMouse: false
  };

  timeGroupOptions = [
    { label: '自動', value: 'auto' },
    { label: '10秒', value: 10 },
    { label: '30秒', value: 30 },
    { label: '60秒', value: 60 },
    { label: '3分鐘', value: 180 },
    { label: '5分鐘', value: 300 },
  ]

  rafTicking = false;

  /* @ngInject */
  constructor(
    $log, $scope, $firebaseObject, $stateParams, twitchApi, $state
  ) {
    this.__deps = { $log, $scope, $firebaseObject, twitchApi, $state };

    const videoId = $stateParams.videoId;
    this.videoId = videoId;

    $scope.$watch(() => videoId, (val, oldVal) => {
      if (val) {
        this.init(val);
      }
    });
  }

  init(videoId) {
    const { twitchApi, $firebaseObject } = this.__deps;

    const db = firebase.database();
    this.data = $firebaseObject(db.ref(`results/v${videoId}`));
    this.videoData = null;
    twitchApi(`videos/${videoId}`)
    .then((res) => {
      this.videoData = res.data;
    });

    this.data.$loaded()
    .then((data) => {
      if (!data.results) {
        const runningRef = db.ref(`running/v${videoId}`);
        runningRef.once('value').then((snapshot) => {
          if (!snapshot.exists()) {
            runningRef.set(true);
          }
        });
      }
    });
  }

  handleTimeGroupClick(val) {
    window.localStorage[KEY_TIME_GROUP] = val;
    this.timeGroup = val;
  }

  handleCurrentTimeTick(videoId, seconds) {
    const { $scope, $state } = this.__deps;

    if (videoId && videoId !== this.videoId) {
      this.videoId = videoId;
      $scope.$digest();
      $state.go('vod', { videoId }, { notify: false });
      return;
    }

    if (this.data.$resolved && this.data.meta) {
      const { start, end } = this.data.meta;
      const frac = seconds / (end - start);

      this.indicator.current = frac * $('canvas')[0].width;
      $scope.$digest();
    }
  }

  handleClick($evt, seconds, point) {
    const { $scope } = this.__deps;

    this.currentTime = seconds;
    $scope.$digest();
  }

  handleDrag($evt, seconds, point) {
    const { $scope } = this.__deps;

    if (this.rafTicking) {
      return;
    }
    this.rafTicking = true;

    raf(() => {
      this.indicator.mouse = $evt.offsetX;
      this.currentTime = seconds;
      $scope.$digest();

      this.rafTicking = false;
    });
  }

  handleMousemove($evt, seconds, point) {
    const { $scope } = this.__deps;

    if (this.rafTicking) {
      return;
    }
    this.rafTicking = true;

    raf(() => {
      this.indicator.mouse = $evt.offsetX;
      $scope.$digest();

      this.rafTicking = false;
    });
  }

  goHome() {
    const { $state } = this.__deps;
    $state.go('home');
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, VodCtrl);
}
