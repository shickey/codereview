'use strict';

/**
 * @ngdoc function
 * @name codeReviewApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the codeReviewApp
 */
 
angular.module('codeReviewApp')
  .controller('EditorCtrl', ['$scope', '$routeParams', 'drive', 'rfc4122', function($scope, $routeParams, drive, rfc4122) {
    
    $scope.file = null;
    
    $scope.comments = [];
    $scope.selectedComments = [];
    
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
        saved: false
      };
      $scope.comments.push(commentModel);
      $scope.comments.sort(function(comment1, comment2) {
        return (comment1.offset) - (comment2.offset);
      });
      $scope.selectCommentsAtOffset(offset);
    };
    
    $scope.saveComment = function(unsavedComment) {
      if (unsavedComment.saved) { return; }
      
      var anchor = {
        r: $scope.file.revision.id,
        a: [{
          txt: {
            o: unsavedComment.offset,
            l: unsavedComment.len,
            ml: +($scope.file.revision.fileSize)
          }
        }]
      };
      
      var comment = {
        content: unsavedComment.content,
        anchor: anchor
      };
      
      drive.addComment($routeParams.fileId, comment).then(function() {
        $scope.removeComment(unsavedComment);
      });
    };
    
    $scope.removeComment = function(commentToRemove) {
      var commentToRemoveId = commentToRemove.id;
      for (var i = 0; i < $scope.comments.length; ++i) {
        var comment = $scope.comments[i];
        if (comment.id === commentToRemoveId) {
          $scope.comments.splice(i, 1);
          break;
        }
      };
    }
    
    
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
          id: comment.commentId,
          offset: anchorPoint.o,
          len: anchorPoint.l,
          content: comment.content,
          authorName: comment.author.displayName,
          selected: false,
          saved: true
        };
        
        $scope.comments.push(commentModel);
      });
      $scope.comments.sort(function(comment1, comment2) {
        return (comment1.offset) - (comment2.offset);
      });
    });
    
    loadFile();
    
  }]);
