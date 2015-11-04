'use strict';

/**
 * @ngdoc overview
 * @name codeReviewApp
 * @description
 * # codeReviewApp
 *
 * Main module of the application.
 */
angular.module('codeReviewApp')
  
  .config(['$routeProvider', 'SECURED_ROUTES', function($routeProvider, SECURED_ROUTES){
    $routeProvider.whenAuthenticated = function(path, route) {
      route.resolve = route.resolve || {};
      route.resolve.user = ['login', function(login) {
        return login.checkAuth();
      }];
      $routeProvider.when(path, route);
      SECURED_ROUTES[path] = true;
      return $routeProvider;
    };
  }])
  
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .whenAuthenticated('/:fileId', {
        templateUrl: 'views/editor.html',
        controller: 'EditorCtrl'
      })
      .whenAuthenticated('/folder/:folderId', {
        templateUrl: 'views/folder.html',
        controller: 'FolderCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  
  .run(['$rootScope', '$location', 'login', 'SECURED_ROUTES', 'loginRedirectPath', function($rootScope, $location, login, SECURED_ROUTES, loginRedirectPath) {
    $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
      if(err === 'AUTH_ERROR') {
        $location.path(loginRedirectPath);
      }
    });
  }])
  
  .constant('SECURED_ROUTES', {})
  .constant('loginRedirectPath', '/');
