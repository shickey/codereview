'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the codeReviewApp
 */
 
angular.module('codeReviewApp')
  .controller('EditorCtrl', ['$scope', '$routeParams', 'drive', function($scope, $routeParams, drive) {
    
    $scope.file = null;
    
    $scope.comments = [];
    
    $scope.offset = 0;
    
    $scope.selectComment = function(comment) {
      $scope.offset = comment.offset;
    }
    
    var commentRangeIncludesOffset = function(comment, offset) {
      return offset >= comment.offset && offset < (comment.offset + comment.len);
    }
    
    var updateSelectionsForOffset = function(offset) {
      $scope.comments.forEach(function(comment) {
        if (commentRangeIncludesOffset(comment, offset)) {
          comment.selected = true;
        }
        else {
          comment.selected = false;
        }
      });
    };
    
    $scope.$watch('offset', function(newOffset) {
      updateSelectionsForOffset(newOffset);
    });
    
    $scope.cursorChanged = function(offset) {
      $scope.offset = offset;
    };
    
    // $scope.addNewComment = function() {
    //   var selectionRange = $scope.editor.getSelectionRange();
    //   if (selectionRange.isEmpty() || !$scope.commentText) { return; }
    //   $scope.addComment(selectionRange, $scope.commentText);
    // };
    
    
    // $scope.selectComment = function(commentVM) {
    //   $scope.editor.selection.setSelectionAnchor(commentVM.marker.range.start.row, commentVM.marker.range.start.column);
    //   $scope.editor.selection.moveCursorToPosition(commentVM.marker.range.start);
    //   $scope.editor.scrollToLine(commentVM.marker.range.start.row, true, true, null);
    // }
    
    // var cursorChanged = function() {
        
    //     $scope.$apply(function(){
    //       var cursor = $scope.editor.selection.getCursor();
          
    //       var commentScrollYTarget = null;
    //       var firstSelectedComment = null;
          
    //       $scope.comments.forEach(function(comment) {
    //         var marker = comment.marker;
    //         if (marker.range.contains(cursor.row, cursor.column)) {
    //           var newY = $scope.editor.renderer.textToScreenCoordinates(cursor.row, cursor.column).pageY;
    //           if (!commentScrollYTarget || newY < commentScrollYTarget) {
    //             commentScrollYTarget = newY < 72.0 ? 72.0 : newY;
    //           };
    //           if (!firstSelectedComment || comment.marker.range.start.row < firstSelectedComment.marker.range.start.row) {
    //             firstSelectedComment = comment;
    //           };
    //           comment.selected = true;
    //           marker.clazz = "comment-range-selected";
    //         }
    //         else {
    //           comment.selected = false;
    //           marker.clazz = "comment-range";
    //         }
    //       });
          
    //       $scope.editor.updateSelectionMarkers();
          
    //       if (firstSelectedComment) {
    //         var el = angular.element(document.querySelector('#comments-list'));
    //         el.css({top: -commentScrollYTarget});
    //       };
          
    //     })
      
    // };
    
    var loadFile = function() {
      var filePromise = drive.loadFile($routeParams.fileId);
      return filePromise.then(function(file) {
        $scope.file = file;
      }, function() {
        console.log('Unable to load file');
      });
    };
    
    $scope.$watchCollection('file.comments', function(newComments) {
      if (!newComments) { return; }
      newComments.forEach(function(comment) {
        if (!comment.hasOwnProperty('anchor')) { return; }
        var anchorPoint = comment.anchor.a[0].txt;
        
        var commentModel = {
          offset: anchorPoint.o,
          len: anchorPoint.l,
          content: comment.content,
          authorName: comment.author.displayName,
          selected: false
        };
        
        $scope.comments.push(commentModel);
      });
      $scope.comments.sort(function(comment1, comment2) {
        return (comment1.offset) - (comment2.offset);
      });
    });
    
    $scope.addComment = function(range, content) {
      var anchorPoint = anchorPointFromRange(range);
      
      var anchor = {
        r: $scope.file.revision.id,
        a: [{
          txt: anchorPoint
        }]
      };
      
      var comment = {
        content: content,
        anchor: anchor
      };
      
      return drive.addComment($routeParams.fileId, comment);
    };
    
    loadFile();
    
  }]);
