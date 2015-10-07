'use strict';

angular.module('codeReviewApp')
  .directive('commentList', function() {
    return {
      scope: {
        comments: '=',
        selectComment: '&'
      },
      templateUrl: 'scripts/comment-list/comment-list.html',
      replace: true,
      controller: 'CommentListCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CommentListCtrl', ['$scope', function($scope) {
    $scope.selectComment = function(comment) {
      if (!comment) { return; }
      $scope.selectComment(comment);
    };
    
  }]);
