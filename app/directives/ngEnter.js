export const NAME = 'ngEnter';

/* @ngInject */
function directive() {
  return (scope, iElm, iAttrs) => {
    iElm.bind('keydown keypress', function ($evt) {
      if ($evt.which === 13) {
        scope.$apply(() =>
          scope.$eval(iAttrs[NAME])
        );

        $evt.preventDefault();
        return false;
      }
    });
  };
}

export default function configure(ngModule) {
  ngModule.directive(NAME, directive);
}
