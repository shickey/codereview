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
    'ngRoute',
    'ui.ace',
    'ui.scrollpoint',
    'ui.router',
    'angular-spinkit',
    'drive',
    'login',
    'uuid',
    'hc.marked'
  ]);
