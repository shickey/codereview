'use strict';

angular.module('codeReviewApp')
  .directive('commentList', function() {
    return {
      templateUrl: 'scripts/comment-list/comment-list.html',
      controller: 'CommentListCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CommentListCtrl', ['$scope', function($scope) {
    
    $scope.$watch('selectedComments', function(selectedComments) {
      if (selectedComments.length === 0) { return; }
      var commentId = selectedComments[0].id;
      var commentEl = angular.element(document.querySelector('#comment-' + commentId));
      var top = commentEl.position().top;
      var listEl = angular.element(document.querySelector('#comment-list'));
      listEl.css({top: -top});
    });
    
  }]);
