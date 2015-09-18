'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the codeReviewApp
 */
angular.module('codeReviewApp')
  .controller('EditorCtrl', ['$scope', '$routeParams', 'drive', function($scope, $routeParams, drive) {
    
    $scope.file = null;
    
    var loadFile = function() {
      var filePromise = drive.loadFile($routeParams.fileId);
      return filePromise.then(function(file) {
        $scope.file = file;
        return $scope.file;
      }, function() {
        console.log('Unable to load file');
      });
    };
    
    loadFile();
    
  }]);
