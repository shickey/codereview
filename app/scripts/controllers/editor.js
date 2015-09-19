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
      // TODO: Check for empty selection and empty comment
      var selection = $scope.editor.getSelectionRange();
      $scope.addComment(selection, $scope.commentText);
    };
    
    $scope.aceLoaded = function(editor) {
      editor.setReadOnly(true);
      editor.setHighlightActiveLine(false);
      editor.$blockScrolling = Infinity; // (Suggested) hack to fix console warning
      $scope.editor = editor;
      
      loadFile();
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
        
        var anchor = JSON.parse(comment.anchor).a[0].txt;
        var session = $scope.editor.getSession();
        var doc = session.getDocument();
        var start = doc.indexToPosition(anchor.o);
        var end = doc.indexToPosition(anchor.o + anchor.l);
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
