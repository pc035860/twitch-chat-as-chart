export const NAME = 'updateTitle';

/* @ngInject */
function directive($timeout) {
  return {
    restrict: 'A',
    scope: {
      utSuffix: '@'
    },
    link(scope, iElm, iAttrs) {
      const originTitle = iElm.text();
      scope.$on('$stateChangeSuccess', ($evt, toState) => {
        let title = originTitle;
        if (toState.data && toState.data.pageTitle) {
          title = toState.data.pageTitle;

          if (angular.isDefined(scope.utSuffix) && scope.utSuffix) {
            title = `${title} ${scope.utSuffix}`;
          }
        }

        $timeout(() => {
          iElm.text(title);
        }, 0, false);
      });
    }
  };
}

export default function configure(ngModule) {
  ngModule.directive(NAME, directive);
}
