'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the codeReviewApp
 */
angular.module('codeReviewApp')
  .controller('MainCtrl', ['$scope', '$routeParams', '$q', 'drive', 'login', function ($scope, $routeParams, $q, drive, login) {
    
    var DEFAULT_FILE = {
      content: '',
      metadata: {
        id: null,
        title: 'untitled.txt',
        mimeType: 'text/plain',
        editable: true
      }
    };

    $scope.file = null;
    $scope.loading = true;
    
    $scope.openFile = function() {
      console.log('hello world!');
      drive.showPicker().then(function(id) {
        console.log(id);
      });
    };
    
    var showMessage = function(message) {
      console.log(message);
    };
    
    var load = function(fileId) {
      var filePromise = fileId ? drive.loadFile(fileId) : $q.when(DEFAULT_FILE);
      return filePromise.then(function(file) {
        $scope.file = file;
        return $scope.file;
      }, function() {
        if(fileId) {
          showMessage('Unable to load file');
        }
        return load();
      });
    };
    
    // Authenticate & load doc
    var loadFn = angular.bind($scope, load, $routeParams.fileId);
    login.checkAuth($routeParams.user).then(loadFn, function() {
      return login.showLoginDialog(null, $routeParams.user).then(loadFn);
    }).finally(function() {
      $scope.loading = false;
    });
    
  }]);
