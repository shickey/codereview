'use strict';

angular.module('codeReviewApp').controller('CommentListCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    
    $scope.$watch('selectedComments', function(selectedComments) {
      if (selectedComments.length === 0) { return; }
      $timeout(function() {
        var commentId = selectedComments[0].id;
        var commentEl = angular.element(document.querySelector('#comment-' + commentId));
        var top = commentEl.position().top;
        $("#comment-list").animate({scrollTop: top - 72}); // TODO: Fix up scrolling locations
      });
    });
    
  }]);
