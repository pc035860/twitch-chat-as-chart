import firebase from 'firebase';

export const NAME = 'VodCtrl';

class VodCtrl {
  __deps;

  /* @ngInject */
  constructor(
    $log, $http, $scope, $firebaseObject, $stateParams
  ) {
    this.__deps = { $log };

    const videoId = $stateParams.videoId;
    const ref = firebase.database().ref(`results/v${videoId}`);

    this.videoId = videoId;
    this.data = $firebaseObject(ref);
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, VodCtrl);
}
