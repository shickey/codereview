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
    
    $scope.OPENABLE_MIME_TYPES = ['text/x-python'];
    
    $scope.children = [];
    $scope.folderId = $stateParams.folderId || 'root';
    $scope.folderMetadata = undefined;
    $scope.fileId = undefined;
    
    drive.fetchFolderMetadata($scope.folderId).then(function(metadata) {
      $scope.folderMetadata = metadata;
    });
    
    drive.fetchChildrenOfFolder($scope.folderId).then(function(children) {
      $scope.children = children;
      var titleCompare = function(c1, c2) {
        if (c1.title < c2.title) {
          return -1;
        }
        else if (c1.title > c2.title) {
          return 1;
        }
        return 0;
      };
      $scope.children.sort(function(c1, c2) {
        if ($scope.isFolder(c1)) {
          if ($scope.isFolder(c2)) {
            return titleCompare(c1, c2);
          }
          return -1;
        }
        if ($scope.isFolder(c2)) {
          return 1;
        }
        return titleCompare(c1, c2);
      });
    });
    
    $scope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
      $scope.fileId = toParams.fileId;
    });
    
    $scope.isOpenable = function(child) {
      return $scope.OPENABLE_MIME_TYPES.indexOf(child.mimeType) !== -1 || $scope.isFolder(child);
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