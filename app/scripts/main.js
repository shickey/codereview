'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the codeReviewApp
 */
angular.module('codeReviewApp')
  .controller('MainCtrl', ['$scope', '$location', 'login', 'drive', function($scope, $location, login, drive) {
    $scope.loading    = true;
    $scope.isLoggedIn = false;
    
    login.checkAuth().then(function() {
      $scope.isLoggedIn = true;
    }).finally(function() {
      $scope.loading = false;
    });
    
    $scope.login = function() {
      login.login().then(function() {
        $scope.isLoggedIn = true;
      });
    };
    
    $scope.openFile = function() {
      drive.showPicker().then(function(result) {
        if (result.type === 'file') {
          $location.path('/' + result.id);
        }
        else if (result.type === 'folder') {
          $location.path('/folder/' + result.id);
        }
        
      });
    };
    
  }]);
