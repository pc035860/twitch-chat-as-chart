import angular from 'angular';
import firebase from 'firebase';

import constants from './constants';
import configs from './configs';
import services from './services';
import directives from './directives';
import components from './components';
import controllers from './controllers';

import { firebase as firebaseConfig } from './config';

import './sass/index.scss';

firebase.initializeApp(firebaseConfig);

const ngAppName = 'vodAnalyzeApp';

const ngModule = angular.module(ngAppName, [
  'ngAnimate',
  'ui.router',
  'firebase'
]);

constants(ngModule);
configs(ngModule);
services(ngModule);
controllers(ngModule);
directives(ngModule);
components(ngModule);

/* @ngInject */
function run() { }

ngModule.run(run);
