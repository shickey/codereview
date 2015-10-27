'use strict';

/**
 * @ngdoc overview
 * @name codeReviewApp
 * @description
 * # codeReviewApp
 *
 * Configuration for Google API
 */
angular.module('codeReviewApp')
  .constant('apiKey', null)
  .constant('clientId', '669299579698-6fvvrtmplsldbpkjv1grvl7ft7ukaam9.apps.googleusercontent.com')
  .constant('applicationId', '669299579698')
  .constant('scope', ['email', 'profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.install'])
  .constant('loadApis', {
    'drive' : 'v2',
    'oauth2' : 'v2'
  });