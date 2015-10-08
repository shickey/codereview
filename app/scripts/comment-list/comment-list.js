'use strict';

angular.module('codeReviewApp')
  .directive('commentList', function() {
    return {
      link: function(scope, element, attrs) {
        scope.listElement = element;
      },
      templateUrl: 'scripts/comment-list/comment-list.html',
      controller: 'CommentListCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CommentListCtrl', ['$scope', function($scope) {
    
    $scope.$watch('selectedComments', function(selectedComments) {
      if (selectedComments.length === 0) { return; }
      var commentId = selectedComments[0].id;
      var el = angular.element(document.querySelector('#comment-' + commentId));
      var top = el.position().top;
      $scope.listElement.css({top: -top, position: 'absolute'});
    });
    
  }]);
