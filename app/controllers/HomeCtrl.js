export const NAME = 'HomeCtrl';

class HomeCtrl {
  __deps;

  /* @ngInject */
  constructor(
    $log, $http, $scope
  ) {
    this.__deps = { $log };
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, HomeCtrl);
}
