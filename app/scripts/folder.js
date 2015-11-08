'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:FolderCtrl
 * @description
 * # FolderCtrl
 * Controller of the codeReviewApp
 */
 
angular.module('codeReviewApp')
  .controller('FolderCtrl', ['$scope', '$stateParams', 'drive', function($scope, $stateParams, drive) {
    
    $scope.files = [];
    $scope.folderId = $stateParams.folderId;
    
    drive.fetchChildrenOfFolder($stateParams.folderId).then(function(children) {
      $scope.files = children;
    })
    
  }]);