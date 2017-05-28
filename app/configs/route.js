/* @ngInject */
function config($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
    url: '/',
    controller: 'HomeCtrl',
    controllerAs: '$ctrl',
    template: require('../views/home.html')
  })
  .state('vod', {
    url: '/v/{videoId:int}',
    controller: 'VodCtrl',
    controllerAs: '$ctrl',
    template: require('../views/vod.html')
  });

  $urlRouterProvider.otherwise('/');
}

export default function configure(ngModule) {
  ngModule.config(config);
}
