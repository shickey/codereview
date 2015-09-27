'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the codeReviewApp
 */
 
angular.module('codeReviewApp')
  .directive('dumbClick', function() {
    
    var link = function(scope, element, attrs) {
      element.on('click', scope.dumbClick);
    };
    
    return {
      restrict: 'A',
      link: link,
      scope: {
        dumbClick: '&'
      }
    }
    
  });
 
angular.module('codeReviewApp')
  .controller('EditorCtrl', ['$scope', '$routeParams', 'drive', function($scope, $routeParams, drive) {
    
    $scope.editor = null;
    $scope.file = null;
    
    $scope.commentText = '';
    
    $scope.commentsVM = [];
    
    $scope.addNewComment = function() {
      var selectionRange = $scope.editor.getSelectionRange();
      if (selectionRange.isEmpty() || !$scope.commentText) { return; }
      $scope.addComment(selectionRange, $scope.commentText);
    };
    
    $scope.aceLoaded = function(editor) {
      editor.setReadOnly(true);
      editor.setHighlightActiveLine(false);
      editor.$blockScrolling = Infinity; // (Suggested) hack to fix console warning
      $scope.editor = editor;
      
      loadFile().then(function() {
        // Wait until the file is done loading to set up
        // the event handler, otherwise $apply will be
        // called multiple times
        editor.selection.on('changeCursor', cursorChanged);
      });
      
    };
    
    $scope.selectComment = function(commentVM) {
      $scope.editor.selection.setSelectionAnchor(commentVM.marker.range.start.row, commentVM.marker.range.start.column);
      $scope.editor.selection.moveCursorToPosition(commentVM.marker.range.start);
    }
    
    var cursorChanged = function() {
        
        $scope.$apply(function(){
          var cursor = $scope.editor.selection.getCursor();
          
          $scope.commentsVM.forEach(function(comment) {
            var marker = comment.marker;
            if (marker.range.contains(cursor.row, cursor.column)) {
              comment.selected = true;
              console.log(comment.content);
            }
            else {
              comment.selected = false;
            }
          });
        })
      
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
    
    var rangeFromAnchorPoint = function(anchorPoint) {
      var Range = require('ace/range').Range;
      
      var doc = $scope.editor.getSession().getDocument();
      var start = doc.indexToPosition(anchorPoint.o);
      var end = doc.indexToPosition(anchorPoint.o + anchorPoint.l);
      
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
    }
    
    $scope.$watchCollection('file.comments', function(newComments) {
      if (!newComments) { return; }
      newComments.forEach(function(comment) {
        if (!comment.hasOwnProperty('anchor')) { return; }
        var anchorPoint = comment.anchor.a[0].txt;
        var range = rangeFromAnchorPoint(anchorPoint);
        var markerId = $scope.editor.session.addMarker(range, 'comment-range', 'text');
        var marker = $scope.editor.session.$backMarkers[markerId];
        
        var commentModel = {
          anchorPoint: anchorPoint,
          content: comment.content,
          displayName: comment.author.displayName,
          marker: marker,
          selected: false
        };
        
        $scope.commentsVM.push(commentModel);
          
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
    
  }]);
