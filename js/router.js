'use strict';

angular.module('codeReviewApp')

  .config(['$stateProvider', 'SECURED_STATES', function($stateProvider, SECURED_STATES) {
    
    $stateProvider.authenticatedState = function(state, route) {
      route.resolve = route.resolve || {};
      route.resolve.user = ['login', function(login) {
        return login.checkAuth();
      }];
      $stateProvider.state(state, route);
      SECURED_STATES[state] = true;
      return $stateProvider;
    };
    
  }])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/");
    
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      })
      .authenticatedState('home', {
        url: '/home',
        templateUrl: 'templates/folder.html',
        controller: 'FolderCtrl'
      })
      .authenticatedState('file', {
        url: '/:fileId',
        templateUrl: 'templates/editor.html',
        controller: 'EditorCtrl'
      })
      .authenticatedState('folder', {
        url: '/folder/:folderId',
        templateUrl: 'templates/folder.html',
        controller: 'FolderCtrl'
      })
      .authenticatedState('folder.file', {
        url: '/:fileId',
        templateUrl: 'templates/editor.html',
        controller: 'EditorCtrl'
      })
    
  }])
  
  .run(['$rootScope', '$state', 'login', 'SECURED_STATES', 'loginRedirectState', function($rootScope, $state, login, SECURED_STATES, loginRedirectState) {
    $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error) {
      if(err === 'AUTH_ERROR') {
        $state.go(loginRedirectState);
      }
    });
  }])
  
  .constant('SECURED_STATES', {})
  .constant('loginRedirectState', '/')