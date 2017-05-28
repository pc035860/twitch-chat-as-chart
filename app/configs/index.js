import routeConfig from './route';

/* @ngInject */
function config(
  $compileProvider, $logProvider, $animateProvider, $httpProvider, $locationProvider
) {
  if (process.env.NODE_ENV === 'production') {
    $compileProvider.debugInfoEnabled(false);
    $logProvider.debugEnabled(false);
  }

  /**
   * Boost animation performance
   */
  // also support bootstrap modal fading
  $animateProvider.classNameFilter(/\b(ng-anim|fade)\b/);

  // result in '/#/' urls
  $locationProvider.hashPrefix('');
}

export default (ngModule) => {
  ngModule.config(config);

  routeConfig(ngModule);
};
