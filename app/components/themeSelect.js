export const NAME = 'themeSelect';

const template = `
  <div class="btn-group c-theme-select" uib-dropdown>
    <button type="button" class="btn btn-default" uib-dropdown-toggle>
      <i class="fa fa-angle-down"></i>
      {{$ctrl.activeThemeLabel}}
    </button>
    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
      <li role="menuitem" ng-repeat="theme in $ctrl.themes track by $index" ng-class="{'is-active': theme.value == $ctrl.activeTheme}">
        <a href="" ng-click="$ctrl.onThemeItemClick(theme)">{{::theme.label}}</a>
      </li>
    </ul>
  </div>
`;

class ThemeSelectCtrl {
  themes;
  activeTheme;
  onThemeChange;

  activeThemeLabel;

  /* @ngInject */
  constructor($scope) {
    if (angular.isDefined(this.themes) && angular.isDefined(this.activeTheme)) {
      $scope.$watch(() => this.activeTheme, (activeTheme) => {
        angular.forEach(this.themes, (t) => {
          if (t.value === activeTheme) {
            this.activeThemeLabel = t.label;
          }
        });
      });
    }
  }

  onThemeItemClick(theme) {
    if (angular.isDefined(this.onThemeChange)) {
      this.onThemeChange({ $theme: theme.value });
    }
  }
}


const component = {
  bindings: {
    activeTheme: '<',
    themes: '<',
    onThemeChange: '&'
  },
  controller: ThemeSelectCtrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
