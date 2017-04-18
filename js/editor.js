'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the codeReviewApp
 */
 
angular.module('codeReviewApp')
  .controller('EditorCtrl', ['$scope', '$state', '$stateParams', 'drive', 'rfc4122', function($scope, $state, $stateParams, drive, rfc4122) {
    
    $scope.file = null;
    
    $scope.comments = [];
    $scope.selectedComments = [];
    $scope.editorMode = undefined;
    
    /*
     *  Menu Items
     */
    $scope.openFile = function() {
      drive.showPicker().then(function(fileId) {
        $state.go('file', {fileId: fileId});
      });
    }
    
    $scope.shareFile = function() {
      drive.showSharing($stateParams.fileId);
    }
    
    $scope.selectComment = function(comment) {
      $scope.selectCommentsAtOffset(comment.offset);
    };
    
    $scope.selectCommentsAtOffset = function(offset) {
      $scope.selectedComments = [];
      $scope.comments.forEach(function(comment) {
        if (commentRangeIncludesOffset(comment, offset)) {
          $scope.selectedComments.push(comment);
          comment.selected = true;
        }
        else {
          comment.selected = false;
        }
      });
    };
    
    var commentRangeIncludesOffset = function(comment, offset) {
      return offset >= comment.offset && offset < (comment.offset + comment.len);
    };
    
    $scope.insertComment = function(offset, len) {
      var commentModel = {
        id: 'unsaved-' + rfc4122.v4(),
        offset: offset,
        len: len,
        content: '',
        selected: false,
        saved: false,
        editing: true
      };
      $scope.comments.push(commentModel);
      $scope.comments.sort(function(comment1, comment2) {
        return (comment1.offset) - (comment2.offset);
      });
      $scope.selectCommentsAtOffset(offset);
    };
    
    $scope.saveComment = function(editingComment) {
      if (editingComment.saved) {
        drive.updateComment($stateParams.fileId, editingComment.id, editingComment.content).then(function() {
          editingComment.editing = false;
        });
        return;
      }
      
      var anchor = {
        r: $scope.file.revision.id,
        a: [{
          txt: {
            o: editingComment.offset,
            l: editingComment.len,
            ml: +($scope.file.revision.size)
          }
        }]
      };
      
      var comment = {
        content: editingComment.content,
        anchor: anchor
      };
      
      drive.createComment($stateParams.fileId, comment).then(function() {
        removeUnsavedComment(editingComment);
      });
    };
    
    var removeUnsavedComment = function(commentToRemove) {
      var commentToRemoveId = commentToRemove.id;
      for (var i = 0; i < $scope.comments.length; ++i) {
        var comment = $scope.comments[i];
        if (comment.id === commentToRemoveId) {
          $scope.comments.splice(i, 1);
          break;
        }
      };
    }
    
    $scope.cancelEditing = function(editingComment) {
      if (!editingComment.saved) {
        removeUnsavedComment(editingComment);
        return;
      };
      editingComment.content = editingComment.previousContent;
      delete editingComment.previousContent;
      editingComment.editing = false;
    }
    
    $scope.beginEditing = function(commentToEdit) {
      commentToEdit.editing = true;
      commentToEdit.previousContent = commentToEdit.content;
    };
    
    $scope.deleteComment = function(commentToDelete) {
      drive.deleteComment($stateParams.fileId, commentToDelete.id);
    }
    
    var loadFile = function() {
      var filePromise = drive.loadFile($stateParams.fileId);
      return filePromise.then(function(file) {
        $scope.file = file;
      }, function() {
        console.log('Unable to load file');
      });
    };

    $scope.$watch('file.metadata.mimeType', function(newMimeType) {
      if (!newMimeType) { return; }
      if (newMimeType == 'text/x-python' || newMimeType == 'text/x-python-script') {
        $scope.editorMode = 'python';
      }
      else if (newMimeType == 'text/html') {
        $scope.editorMode = 'html';
      }
      else if (newMimeType == 'text/css') {
        $scope.editorMode = 'css';
      }
<<<<<<< HEAD:js/editor.js
      else if (newMimeType == 'application/x-javascript') {
=======
      else if (newMimeType == 'application/x-javascript' || newMimeType == 'text/javascript') {
>>>>>>> master:js/editor.js
        $scope.editorMode = 'javascript';
      }
      else if (newMimeType == 'application/octet-stream') {
        // Generic binary file. We take our best guess based on file extension
        var filenameComponents = $scope.file.metadata.name.split('.');
        if (filenameComponents.length > 1) {
          var ext = filenameComponents[filenameComponents.length - 1];
          if (ext === 'swift') {
            $scope.editorMode = 'swift';
          }
        }
        else {
          console.log("unrecognized file type");
        }
      }
      else {
<<<<<<< HEAD:js/editor.js
        console.log("unrecognized MIME type");
=======
        console.log("unrecognized MIME type: " + newMimeType);
>>>>>>> master:js/editor.js
      }
    });
    
    $scope.$watchCollection('file.comments', function(newComments) {
      if (!newComments) { return; }
      $scope.comments = [];
      newComments.forEach(function(comment) {
        if (!comment.hasOwnProperty('anchor')) { return; }
        var anchorPoint = comment.anchor.a[0].txt;

        var commentModel = {
          id: comment.id,
          offset: anchorPoint.o,
          len: anchorPoint.l,
          content: comment.content,
          author: {
            name: comment.author.displayName,
            isMe: comment.author.me
          },
          selected: false,
          saved: true,
          editing: false
        };
        
        $scope.comments.push(commentModel);
      });
      $scope.comments.sort(function(comment1, comment2) {
        return (comment1.offset) - (comment2.offset);
      });
    });
    
    loadFile();
    
  }]);
