'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:FolderCtrl
 * @description
 * # FolderCtrl
 * Controller of the codeReviewApp
 */
 
angular.module('codeReviewApp')
  .controller('FolderCtrl', ['$scope', '$stateParams', '$state', 'drive', function($scope, $stateParams, $state, drive) {
    
    $scope.ACCEPTABLE_MIME_TYPES = ['application/vnd.google-apps.folder', 'text/x-python'];
    
    $scope.files = [];
    $scope.folderId = $stateParams.folderId || 'root';
    $scope.fileId = undefined;
    
    drive.fetchChildrenOfFolder($scope.folderId).then(function(children) {
      $scope.files = children;
    });
    
    $scope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
      $scope.fileId = toParams.fileId;
    });
    
    $scope.mimeTypeFilter = function(folderChild) {
      return $scope.ACCEPTABLE_MIME_TYPES.indexOf(folderChild.mimeType) !== -1;
    };
    
    $scope.goToFolder = function(folderId) {
      $state.go('folder', {folderId: folderId});
    };
    
  }]);