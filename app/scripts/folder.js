'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:FolderCtrl
 * @description
 * # FolderCtrl
 * Controller of the codeReviewApp
 */
 
angular.module('codeReviewApp')
  .controller('FolderCtrl', ['$scope', '$routeParams', 'drive', function($scope, $routeParams, drive) {
    
    drive.fetchChildrenOfFolder($routeParams.folderId).then(function(items) {
      console.log(items);
    })
    
  }]);