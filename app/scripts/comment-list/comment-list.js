'use strict';

angular.module('codeReviewApp')
  .directive('commentList', function() {
    return {
      templateUrl: 'scripts/comment-list/comment-list.html',
      controller: 'CommentListCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CommentListCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    
    $scope.$watch('selectedComments', function(selectedComments) {
      if (selectedComments.length === 0) { return; }
      $timeout(function() {
        var commentId = selectedComments[0].id;
        var commentEl = angular.element(document.querySelector('#comment-' + commentId));
        var top = commentEl.position().top;
        $("body").animate({scrollTop: top - 40});
      });
    });
    
  }]);
