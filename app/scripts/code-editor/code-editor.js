'use strict';

angular.module('codeReviewApp')
  .directive('codeEditor', function() {
    return {
      scope: {
        code: '=',
        comments: '=',
        cursorChange: '&'
      },
      templateUrl: 'scripts/code-editor/code-editor.html',
      replace: true,
      controller: 'CodeEditorCtrl',
      controllerAs: 'ctrl'
    };
  })
  .controller('CodeEditorCtrl', ['$scope', function($scope) {
    
    $scope.editor = null;
    
    $scope.aceLoaded = function(_editor) {
      _editor.setReadOnly(true);
      _editor.setHighlightActiveLine(false);
      _editor.$blockScrolling = Infinity; // (Suggested) hack to fix console warning
      _editor.renderer.setAnimatedScroll(true);
      _editor.selection.on('changeCursor', function() {
        $scope.$apply(function() {
          var cursor = _editor.selection.getCursor();
          var offset = _editor.session.doc.positionToIndex(cursor);
          $scope.cursorChange({offset: offset});
        });
      });
      $scope.editor = _editor;
    };
    
    $scope.$watch('code', function(val) {
      if (!($scope.editor)) { return; };
      $scope.editor.setValue(val);
      $scope.editor.clearSelection();
    });
    
  }]);