'use strict';

angular.module('codeReviewApp')
  .directive('commentList', function() {
    return {
      templateUrl: 'scripts/comment-list/comment-list.html',
      replace: true,
      controller: 'CommentListCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CommentListCtrl', function() {
    
  });
