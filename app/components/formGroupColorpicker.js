import contrast_ from 'contrast';
import memoize from 'lodash/memoize';

const contrast = memoize(contrast_);

export const NAME = 'formGroupColorpicker';

let _uniqId = 1;

const template = `
  <div class="form-group" ng-class="{
    'is-dark': $ctrl.isDark($ctrl.model)
  }">
    <label for="{{$ctrl.id}}">{{$ctrl.label}}</label>
    <input type="text" class="form-control" id="{{$ctrl.id}}" placeholder="{{$ctrl.placeholder}}" ng-model="$ctrl.model"
    ng-style="{ backgroundColor: $ctrl.model }" ng-readonly="$ctrl.readonly"
    colorpicker="hex" colorpicker-position="right" colorpicker-size="150">
  </div>
`;

class FormGroupColorpickerCtrl {
  id;
  readonly = false;

  /* @ngInject */
  constructor($injector) {
    this.id = this.getId(_uniqId++);

    // optional matchmedia
    let matchmedia;
    try {
      matchmedia = $injector.get('matchmedia');
    }
    catch (e) {
      matchmedia = null;
    }
    // 對手機或平板阻止 input keyboard (設為 readonly)
    if (matchmedia && (matchmedia.isTablet() || matchmedia.isPhone())) {
      this.readonly = true;
    }
  }

  getId(uniqId) {
    return `gen-colorpicker-${uniqId}`;
  }

  isDark(hexColor) {
    return contrast(hexColor) === 'dark';
  }
}

const component = {
  bindings: {
    model: '=',
    label: '@',
    placeholder: '@'
  },
  controller: FormGroupColorpickerCtrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
