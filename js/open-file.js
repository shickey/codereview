'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:OpenFileCtrl
 * @description
 * # OpenFileCtrl
 * Controller of the codeReviewApp
 */
angular.module('codeReviewApp')
  .controller('OpenFileCtrl', ['$scope', '$timeout', '$state', 'drive', function($scope, $timeout, $state, drive) {
    
    function showPicker() {
      drive.showPicker().then(function(fileId) {
        $state.go('file', {fileId: fileId});
      }, function() {
        $('#select-error').modal({
          keyboard: false,
          backdrop: 'static'
        });
      });
    }
    
    $scope.closeModalAlert = function() {
      $('#select-error').modal('hide');
      showPicker();
    }
    
    showPicker();
    
  }]);
