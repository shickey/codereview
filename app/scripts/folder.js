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
    
    $scope.children = [];
    $scope.folderId = $stateParams.folderId || 'root';
    $scope.fileId = undefined;
    
    drive.fetchChildrenOfFolder($scope.folderId).then(function(children) {
      $scope.children = children;
    });
    
    $scope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
      $scope.fileId = toParams.fileId;
    });
    
    $scope.mimeTypeFilter = function(folderChild) {
      return $scope.ACCEPTABLE_MIME_TYPES.indexOf(folderChild.mimeType) !== -1;
    };
    
    $scope.isFolder = function(child) {
      return child.mimeType === 'application/vnd.google-apps.folder';
    }
    
    $scope.goToChild = function(childId, isFolder) {
      if (isFolder) {
        $state.go('folder', {folderId: childId});
      }
      else {
        $state.go('folder.file', {folderId: $scope.folderId, fileId: childId});
      }
    };
    
  }]);