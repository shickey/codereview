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
    
    $scope.editor = null;
    $scope.file = null;
    
    $scope.aceLoaded = function(editor) {
      editor.setReadOnly(true);
      $scope.editor = editor;
      
      loadFile();
    };
    
    var loadFile = function() {
      var filePromise = drive.loadFile($routeParams.fileId);
      return filePromise.then(function(file) {
        $scope.file = file;
        $scope.editor.setValue(file.content);
      }, function() {
        console.log('Unable to load file');
      });
    };
    
  }]);
