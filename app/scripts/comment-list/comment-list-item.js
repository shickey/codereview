'use strict';

angular.module('codeReviewApp')
  .directive('commentListItem', function() {
    return {
      scope: {
        comment: '='
      },
      templateUrl: 'scripts/comment-list/comment-list-item.html',
      replace: true,
      controller: 'CommentListItemCtrl',
      controllerAs: 'ctrl'
    }
  })
  .controller('CommentListItemCtrl', ['$scope', function($scope) {
    // $scope.selectComment = function() {
      
    // }
  }]);