'use strict';

/**
 * @ngdoc overview
 * @name codeReviewApp
 * @description
 * # codeReviewApp
 *
 * Main module of the application.
 */
angular
  .module('codeReviewApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngAria',
    'ui.ace',
    'editor.drive',
    'editor.login',
    'ngMaterial'
  ])
  .constant('apiKey', null)
  .constant('clientId', '669299579698-6fvvrtmplsldbpkjv1grvl7ft7ukaam9.apps.googleusercontent.com')
  .constant('applicationId', '669299579698')
  .constant('scope', ['email', 'profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.install'])
  .constant('loadApis', {
    'drive' : 'v2'
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
