'use strict';

angular.module('codeReviewApp')
  .directive('codeEditor', function() {
    return {
      scope: {
        code: '=',
        comments: '=',
        cursorChange: '&',
        offset: '='
      },
      templateUrl: 'scripts/code-editor/code-editor.html',
      replace: true,
      controller: 'CodeEditorCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CodeEditorCtrl', ['$scope', function($scope) {
    
    var Range = require('ace/range').Range;
    
    $scope.editor = null;
    
    $scope.aceLoaded = function(_editor) {
      _editor.setReadOnly(true);
      _editor.setHighlightActiveLine(false);
      _editor.$blockScrolling = Infinity; // (Suggested) hack to fix console warning
      _editor.renderer.setAnimatedScroll(true);
      _editor.selection.on('changeCursor', emitCursorChangeEvent);
      $scope.editor = _editor;
    };
    
    $scope.$watch('code', function(val) {
      if (!($scope.editor)) { return; }
      $scope.editor.setValue(val);
      $scope.editor.clearSelection();
      refreshComments();
    });
    
    $scope.$watchCollection('comments', function() {
      refreshComments();
    });
    
    $scope.$watch('offset', function(newOffset) {
      console.log('offset changed!');
      var selection = $scope.editor.selection;
      selection.off('changeCursor', emitCursorChangeEvent);
      
      var range = rangeFromAnchorPoint(newOffset, 0);
      selection.setSelectionAnchor(range.start.row, range.start.column);
      selection.moveCursorToPosition(range.start);
      $scope.editor.scrollToLine(range.start.row, true, true, null);
      
      selection.on('changeCursor', emitCursorChangeEvent);
    });
    
    var emitCursorChangeEvent = function() {
      $scope.$apply(function() {
        var cursor = $scope.editor.selection.getCursor();
        var offset = $scope.editor.session.doc.positionToIndex(cursor);
        $scope.cursorChange({offset: offset});
      });
    };
    
    var refreshComments = function() {
      var session = $scope.editor.session;
      var markers = session.getMarkers();
      for (var markerId in markers) {
        session.removeMarker(markerId);
      }
      $scope.comments.forEach(function(comment) {
        addCommentMarker(comment);
      });
    };
    
    var addCommentMarker = function(comment) {
      var range = rangeFromAnchorPoint(comment.offset, comment.len);
      $scope.editor.session.addMarker(range, 'comment-range', 'text');
    };
    
    var rangeFromAnchorPoint = function(offset, len) {
      var doc = $scope.editor.getSession().getDocument();
      var start = doc.indexToPosition(offset);
      var end = doc.indexToPosition(offset + len);
      
      var range = new Range(start.row, start.column, end.row, end.column);
      return range;
    };
    
  }]);