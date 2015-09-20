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
    
    $scope.editor = null;
    $scope.file = null;
    
    $scope.commentText = '';
    
    $scope.addNewComment = function() {
      var selectionRange = $scope.editor.getSelectionRange();
      if (selectionRange.isEmpty() || !$scope.commentText) { return; }
      $scope.addComment(selectionRange, $scope.commentText);
    };
    
    $scope.aceLoaded = function(editor) {
      editor.setReadOnly(true);
      editor.setHighlightActiveLine(false);
      editor.$blockScrolling = Infinity; // (Suggested) hack to fix console warning
      editor.selection.on('changeCursor', cursorChanged);
      $scope.editor = editor;
      
      loadFile();
    };
    
    var cursorChanged = function(e) {
      var cursor = $scope.editor.selection.getCursor();
      var offset = $scope.editor.getSession().getDocument().positionToIndex(cursor);
      var markers = $scope.editor.getSession().getMarkers();
      for (var markerId in markers) {
        var marker = markers[markerId];
        if (marker.clazz === "comment-range") {
          if (marker.range.contains(cursor.row, cursor.column)) {
            console.log($scope.editor.getSession().getDocument().getTextRange(marker.range));
          };
        };
      };
    };
    
    var loadFile = function() {
      var filePromise = drive.loadFile($routeParams.fileId);
      return filePromise.then(function(file) {
        $scope.file = file;
        console.log(file);
        $scope.editor.setValue(file.content);
        $scope.editor.clearSelection();
      }, function() {
        console.log('Unable to load file');
      });
    };
    
    $scope.$watchCollection('file.comments', function(newComments) {
      if (!newComments) { return; }
      for (var i = 0; i < newComments.length; ++i) {
        var comment = newComments[i];
        if (!comment.hasOwnProperty('anchor')) { continue; }
        
        var anchorPosition = comment.anchor.a[0].txt;
        var session = $scope.editor.getSession();
        var doc = session.getDocument();
        var start = doc.indexToPosition(anchorPosition.o);
        var end = doc.indexToPosition(anchorPosition.o + anchorPosition.l);
        var Range = require('ace/range').Range;
        var range = new Range(start.row, start.column, end.row, end.column);
        session.addMarker(range, 'comment-range', 'text');
      }
    });
    
    $scope.addComment = function(range, content) {
      var session = $scope.editor.getSession();
      var doc = session.getDocument();
      var offset = doc.positionToIndex(range.start);
      var endOffset = doc.positionToIndex(range.end);
      var commentLength = endOffset - offset;
      
      var anchor = {
        r: $scope.file.revision.id,
        a: [{
          txt: {
            o: offset,
            l: commentLength,
            ml: +($scope.file.revision.fileSize)
          }
        }]
      };
      
      var comment = {
        content: content,
        anchor: anchor
      };
      
      return drive.addComment($routeParams.fileId, comment);
    };
    
  }]);
