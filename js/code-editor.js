'use strict';

angular.module('codeReviewApp').controller('CodeEditorCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    
    var Range = ace.require('ace/range').Range;
    
    $scope.editor = null;
    $scope.shouldUpdateCursor = true;
    $scope.isRangeSelected = false;
    $scope.selectedRange = undefined;
    $scope.selectionScreenLocation = undefined;
    
    $scope.aceLoaded = function(_editor) {
      _editor.setReadOnly(true);
      _editor.setHighlightActiveLine(false);
      _editor.$blockScrolling = Infinity; // (Suggested) hack to fix console warning
      _editor.renderer.setAnimatedScroll(true);
      _editor.selection.on('changeCursor', changeCursor);
      _editor.selection.on('changeSelection', changeSelection);
      _editor.session.on('changeScrollTop', changeSelection);
      _editor.on('change', redrawCommentMarkers);
      _editor.setAutoScrollEditorIntoView();
      
      _editor.setOption('scrollPastEnd', true);
      
      // Hide the ugly, ugly scrollbars
      _editor.renderer.scrollBarV.width = 0;
      _editor.renderer.scrollBarV.element.style.display = "none";
      
      _editor.renderer.scrollBarH.height = 0;
      _editor.renderer.scrollBarH.element.style.display = "none";
      
      // Turn off auto syntax checking (e.g. for javascript)
      _editor.session.setOption("useWorker", false);
      
      $scope.editor = _editor;
      onResize();
    };
    
    var onResize = function() {
      var winH = document.documentElement.clientHeight;
      var winW = document.documentElement.clientWidth;
      var editorHeight = winH - 51; // TODO: Actually get the nav bar size here;
      $('#code-editor').height(editorHeight);
      
      var editorOffset = $('#code-editor').width() + $('#code-editor').position().left;
      $('#comment-list').outerHeight(editorHeight);
      $('#comment-list').css('margin-left', editorOffset);
      $('#comment-list').css('padding-bottom', editorHeight - 31);
      
      changeSelection();
    }
    
    $(window).resize(onResize);
    
    var changeCursor = function() {
      var cursor = $scope.editor.selection.getCursor();
      var offset = $scope.editor.session.doc.positionToIndex(cursor);
      $timeout(function() { 
        $scope.shouldUpdateCursor = false;
        $scope.selectCommentsAtOffset(offset);
        redrawCommentMarkers();
      });
    };
    
    var changeSelection = function() {
      var selectionRange = $scope.editor.selection.getRange();
      if (selectionRange.isEmpty()) {
        $scope.isRangeSelected = false;
        $scope.selectedRange = undefined;
        $scope.selectionScreenLocation = undefined;
      }
      else {
        $scope.isRangeSelected = true;
        $scope.selectedRange = selectionRange;
        var screenRange = $scope.editor.renderer.textToScreenCoordinates(selectionRange.start.row, selectionRange.start.column);
        $scope.selectionScreenLocation = screenRange;
      }
      $timeout(function(){
        redrawCommentMarkers();
        if ($scope.isRangeSelected) {
          var editorOffset = $('#code-editor').width() + $('#code-editor').position().left;
          $('#add-comment-button').css('left', (editorOffset - 10) + "px");
          $('#add-comment-button').css('top', ($scope.selectionScreenLocation.pageY + 10) + "px");
        }
      });
    };

    $scope.$watch('editorMode', function(newMode) {
      if (newMode) {
        $scope.editor.session.setMode('ace/mode/' + newMode);
      }
    });
    
    $scope.$watch('selectedComments', function(selectedComments) {
      if (!$scope.shouldUpdateCursor) {
        $scope.shouldUpdateCursor = true;
        if (selectedComments.length > 0) {
          $timeout(moveCommentList(selectedComments));
        }
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
      redrawCommentMarkers();
      $timeout(function() {
        moveCommentList(selectedComments);
        selection.on('changeCursor', changeCursor);
      }, 200);
    });
    
    $scope.$watchCollection('comments', function() {
      redrawCommentMarkers();
    });
    
    var moveCommentList = function(selectedComments) {
      var comment = selectedComments[0];
      var offset = comment.offset;
      var range = rangeFromAnchorPoint(offset, 0);
      var screenRange = $scope.editor.renderer.textToScreenCoordinates(range.start.row, range.start.column);
      var commentEl = $('#comment-' + comment.id);
      var top = commentEl.position().top + $("#comment-list").scrollTop();
      var listOffset = top - screenRange.pageY;
      console.log(listOffset);
      if (listOffset <= 31) {
        listOffset = -31;
      }
      $("#comment-list").animate({scrollTop: listOffset});
    }
    
    var redrawCommentMarkers = function() {
      // Just do the simple/dumb thing of clearing all the markers
      // and redrawing them all
      var markerIds = $scope.editor.session.getMarkers();
      for (var markerId in markerIds) {
        var clazz = markerIds[markerId].clazz
        if (clazz == "comment-range" || clazz == "comment-range-selected") {
          $scope.editor.session.removeMarker(markerId);
        }
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
    
    $scope.codeOutput = "";
    
    var codeOutputFunc = function(text) {
      $scope.codeOutput += text;
    };
    
    var errorOutputFunc = function(text) {
      $scope.errorOutput += text;
    }
    
    var clearOutput = function() {
      $scope.codeOutput = "";
      $scope.errorOutput = "";
    };
    
    $scope.runCode = function() {
      clearOutput();
      var code = $scope.file.content;
      Sk.pre = "output";
      Sk.configure({output: codeOutputFunc});
      var promise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, code, true);
      });
      promise.then(function(mod) {
        console.log('success');
      }, function(err) {
        console.log(err.toString());
        $scope.$apply(function() {
          errorOutputFunc(err.toString());
        });
      });
    };
    
  }]);