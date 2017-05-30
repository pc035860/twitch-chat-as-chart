export const NAME = 'AppCtrl';

class AppCtrl {
  __deps;

  /* @ngInject */
  constructor(
    $log, $http, $scope
  ) {
    this.__deps = { $log };
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, AppCtrl);
}
