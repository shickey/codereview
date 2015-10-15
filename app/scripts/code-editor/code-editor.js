'use strict';

angular.module('codeReviewApp')
  .directive('codeEditor', function() {
    return {
      templateUrl: 'scripts/code-editor/code-editor.html',
      replace: true,
      controller: 'CodeEditorCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CodeEditorCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    
    var Range = require('ace/range').Range;
    
    $scope.editor = null;
    
    $scope.aceLoaded = function(_editor) {
      _editor.setReadOnly(true);
      _editor.setHighlightActiveLine(false);
      _editor.$blockScrolling = Infinity; // (Suggested) hack to fix console warning
      _editor.renderer.setAnimatedScroll(true);
      _editor.selection.on('changeCursor', changeCursor);
      _editor.on('change', redrawCommentMarkers);
      $scope.editor = _editor;
    };
    
    $scope.shouldUpdateCursor = true;
    
    var changeCursor = function() {
      var cursor = $scope.editor.selection.getCursor();
      var offset = $scope.editor.session.doc.positionToIndex(cursor);
      $timeout(function() { 
        $scope.shouldUpdateCursor = false;
        $scope.selectCommentsAtOffset(offset);
        redrawCommentMarkers();
      });
    };
    
    $scope.$watch('selectedComments', function(selectedComments) {
      if (!$scope.shouldUpdateCursor) {
        $scope.shouldUpdateCursor = true;
        return;
      }
      if (selectedComments.length === 0) { return; }
      var selection = $scope.editor.selection
      selection.off('changeCursor', changeCursor);

      var lastComment = selectedComments[selectedComments.length - 1];
      var offset = lastComment.offset;
      var range = rangeFromAnchorPoint(offset, 0);
      selection.setSelectionAnchor(range.start.row, range.start.column);
      selection.moveCursorToPosition(range.start);
      $scope.editor.scrollToLine(range.start.row, true, true, null);
      $timeout(function() {
        selection.on('changeCursor', changeCursor);
      })
    });
    
    $scope.$watchCollection('comments', function() {
      redrawCommentMarkers();
    });
    
    var redrawCommentMarkers = function() {
      // Just do the simple/dumb thing of clearing all the markers
      // and redrawing them all
      var markerIds = $scope.editor.session.getMarkers();
      for (var markerId in markerIds) {
        $scope.editor.session.removeMarker(markerId);
      }
      $scope.comments.forEach(function(comment) {
        addCommentMarker(comment);
      });
    };
    
    var addCommentMarker = function(comment) {
      var range = rangeFromAnchorPoint(comment.offset, comment.len);
      if (comment.selected) {
        $scope.editor.session.addMarker(range, 'comment-range-selected', 'text');
      }
      else {
        $scope.editor.session.addMarker(range, 'comment-range', 'text');
      }
    };
    
    var rangeFromAnchorPoint = function(offset, len) {
      var doc = $scope.editor.getSession().getDocument();
      var start = doc.indexToPosition(offset);
      var end = doc.indexToPosition(offset + len);
      
      var range = new Range(start.row, start.column, end.row, end.column);
      return range;
    };
    
    var anchorPointFromRange = function(range) {
      var doc = $scope.editor.getSession().getDocument();
      var offset = doc.positionToIndex(range.start);
      var endOffset = doc.positionToIndex(range.end);
      var length = endOffset - offset;
      
      return {
        o: offset,
        l: length,
        ml: +($scope.file.revision.fileSize)
      }
    };
    
    $scope.insertCommentAtSelection = function() {
      var selectionRange = $scope.editor.getSelectionRange();
      if (selectionRange.isEmpty()) { return; }
      var anchorPoint = anchorPointFromRange(selectionRange);
      $scope.insertComment(anchorPoint.o, anchorPoint.l)
    };
    
  }]);