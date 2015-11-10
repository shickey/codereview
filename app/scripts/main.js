'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the codeReviewApp
 */
angular.module('codeReviewApp')
  .controller('MainCtrl', ['$scope', '$state', 'login', 'drive', function($scope, $state, login, drive) {
    $scope.loading = true;
    
    login.checkAuth().then(function() {
      $state.go('home');
    }, function() {
      $scope.loading = false;
    });
    
    $scope.login = function() {
      login.login().then(function() {
        $state.go('home');
      });
    };
    
  }]);
