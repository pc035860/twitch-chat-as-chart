export const NAME = 'gen';

const template = `
  <div class="c-gen" ng-class="{'is-themeable': $ctrl.themeable}">
    <div class="c-gen__description" ng-transclude="description"></div>
    <div class="c-gen__canvas">
      <div class="c-canvas">
        <div class="c-canvas__canvas" ng-transclude="canvas"></div>
        <div class="c-canvas__backdrop">&nbsp;</div>
      </div>
    </div>
    <div class="container c-gen__container">
      <div class="c-gen__theme-select" ng-if="$ctrl.themeable">
        選擇版型<span class="c-gen__theme-select__btn" ng-transclude="themeSelect"></span>
      </div>
      <form>
        <div class="c-gen__panel">
          <div class="c-gen__panel__left">
            <div class="c-gen__panel__colors" ng-transclude="colors"></div>
          </div>
          <div class="c-gen__panel__right">
            <div class="c-gen__panel__data" ng-transclude="data"></div>
          </div>
          <div class="c-gen__panel__final">
            <span ng-transclude="final"></span>
          </div>
        </div>
      </form>
    </div>
  </div>
`;

class GenCtrl {
  themeable;

  /* @ngInject */
  constructor($scope) { }
}

const component = {
  transclude: {
    description: '?genContentDescription',
    canvas: 'genContentCanvas',
    themeSelect: '?genContentThemeSelect',
    colors: 'genContentColors',
    data: 'genContentData',
    final: 'genContentFinal'
  },
  bindings: {
    themeable: '<'
  },
  controller: GenCtrl,
  template,
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
