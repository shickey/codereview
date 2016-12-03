'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the codeReviewApp
 */
angular.module('codeReviewApp')
  .controller('LoginCtrl', ['$scope', '$state', 'login', 'drive', function($scope, $state, login, drive) {
    $scope.loading = true;
    
    login.checkAuth().then(function() {
      $state.go('open');
    }, function() {
      $scope.loading = false;
    });
    
    $scope.login = function() {
      login.login().then(function() {
        $state.go('open');
      });
    };
    
  }]);
