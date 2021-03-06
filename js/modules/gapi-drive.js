'use strict';

/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var module = angular.module('drive', ['gapi']);

module.service('drive', ['$q', '$cacheFactory', 'googleApi', 'applicationId', function($q, $cacheFactory, googleApi, applicationId) {

  // Only fetch fields that we care about
  var DEFAULT_FILE_FIELDS = 'id,name,mimeType,capabilities,shared,size,webContentLink';
  var DEFAULT_COMMENTS_FIELDS = 'comments(anchor,author,id,content)';
  var DEFAULT_COMMENT_FIELDS = 'anchor,author,id,content';
  var DEFAULT_REVISION_FIELDS = 'size,id';

  var cache = $cacheFactory('files');
  
  /**
   * Combines metadata & content into a single object & caches the result
   *
   * @param {Object} metadata File metadata
   * @param {String} content File content
   * @return {Object} combined object
   */
  var combineAndStoreResults = function(metadata, content, revision, comments) {
    var file = {
      metadata: metadata,
      content: content,
      revision: revision,
      comments: comments,
    };
    cache.put(metadata.id, file);
    return file;
  };

  /**
   * Load a file from Drive. Fetches both the metadata & content in parallel.
   *
   * @param {String} fileID ID of the file to load
   * @return {Promise} promise that resolves to an object containing the file metadata & content
   */
  this.loadFile = function(fileId) {
    var file = cache.get(fileId);
    if (file) {
      return $q.when(file);
    }
    return googleApi.then(function(gapi) {
      var metadataRequest = gapi.client.drive.files.get({
        fileId: fileId,
        fields: DEFAULT_FILE_FIELDS
      });
      var contentRequest = gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
      var revisionRequest = gapi.client.drive.revisions.get({
        fileId: fileId,
        fields: DEFAULT_REVISION_FIELDS,
        revisionId: 'head'
      });
      var commentsRequest = gapi.client.drive.comments.list({
        fileId: fileId,
        fields: DEFAULT_COMMENTS_FIELDS
      });
      return $q.all([$q.when(metadataRequest), $q.when(contentRequest), $q.when(revisionRequest), $q.when(commentsRequest)]);
    }).then(function(responses) {
      var comments = JSON.parse(responses[3].body).comments;
      comments.forEach(function(comment) {
        if (!comment.anchor) { return; };
        comment.anchor = JSON.parse(comment.anchor);
      });
      return combineAndStoreResults(responses[0].result, responses[1].body, JSON.parse(responses[2].body), comments);
    });
  };

 /**
   * Save a file to Drive using the mutlipart upload protocol.
   *
   * @param {Object} metadata File metadata to save
   * @param {String} content File content
   * @return {Promise} promise that resolves to an object containing the current file metadata & content
   */
  this.saveFile = function(metadata, content) {
    return googleApi.then(function(gapi) {
      var path;
      var method;

      if (metadata.id) {
        path = '/upload/drive/v2/files/' + encodeURIComponent(metadata.id);
        method = 'PUT';
      } else {
        path = '/upload/drive/v2/files';
        method = 'POST';
      }

      var multipart = new MultiPartBuilder()
        .append('application/json', JSON.stringify(metadata))
        .append(metadata.mimeType, content)
        .finish();

      var uploadRequest = gapi.client.request({
        path: path,
        method: method,
        params: {
          uploadType: 'multipart',
          fields: DEFAULT_FILE_FIELDS
        },
        headers: { 'Content-Type' : multipart.type },
        body: multipart.body
      });
      return $q.when(uploadRequest);
    }).then(function(response) {
      // TODO: This function call will no longer work
      return combineAndStoreResults(response.result, content);
    });
  };
  
  
  this.createComment = function(fileId, comment) {
    console.log(comment);
    return googleApi.then(function(gapi) {
      var body = {
        content: comment.content,
        anchor:  JSON.stringify(comment.anchor)
      }
      var insertCommentRequest = gapi.client.drive.comments.create({
        fields: DEFAULT_COMMENT_FIELDS,
        fileId: fileId,
        resource: body
      });
      return $q.when(insertCommentRequest);
    }).then(function(response) {
      var cachedFile = cache.get(fileId);
      if (cachedFile && cachedFile.comments) {
        var comment = JSON.parse(response.body);
        if (comment.anchor) {
          comment.anchor = JSON.parse(comment.anchor);
        };
        cachedFile.comments.push(comment);
      };
    });
  };
  
  this.updateComment = function(fileId, commentId, newContent) {
    return googleApi.then(function(gapi) {
      var body = {content: newContent};
      var patchCommentRequest = gapi.client.drive.comments.update({
        fields: DEFAULT_COMMENT_FIELDS,
        fileId: fileId,
        commentId: commentId,
        resource: body
      });
      return $q.when(patchCommentRequest);
    }).then(function(response) {
      var cachedFile = cache.get(fileId);
      if (cachedFile && cachedFile.comments) {
        cachedFile.comments.forEach(function(comment) {
          if (comment.commentId === commentId) {
            comment.content = newContent;
          };
        });
      }
    })
  };
  
  this.deleteComment = function(fileId, commentId) {
    return googleApi.then(function(gapi) {
      var deleteCommentRequest = gapi.client.drive.comments.delete({
        fileId: fileId,
        commentId: commentId
      });
      return $q.when(deleteCommentRequest);
    }).then(function(response) {
      var cachedFile = cache.get(fileId);
      if (cachedFile && cachedFile.comments) {
        for (var i = 0; i < cachedFile.comments.length; ++i) {
          var comment = cachedFile.comments[i];
          if (comment.id === commentId) {
            cachedFile.comments.splice(i, 1);
            break;
          }
        }
      }
    });
  };
  
  /*
   * Folder Stuff
   */
  //  this.fetchFolderMetadata = function(folderId) {
  //   return googleApi.then(function(gapi) {
  //     return gapi.client.drive.files.get({
  //       fileId: folderId,
  //       fields: DEFAULT_FILE_FIELDS
  //     });
  //   }).then(function(response) {
  //     return JSON.parse(response.body);
  //   });
  //  }
   
  // this.fetchChildrenOfFolder = function(folderId) {
  //   var folderChildren = folderCache.get(folderId);
  //   if (folderChildren) {
  //     return $q.when(folderChildren);
  //   }
  //   return googleApi.then(function(gapi) {
  //     return gapi.client.drive.files.list({
  //       fields: DEFAULT_FOLDER_CHILDREN_FIELDS,
  //       q: '\'' + folderId + '\' in parents and trashed=false' 
  //     });
  //   }).then(function(response) {
  //     var items = JSON.parse(response.body).items;
  //     folderCache.put(folderId, items);
  //     return items;
  //   });
  // }

  /**
   * Displays the Drive file picker configured for selecting text files
   *
   * @return {Promise} Promise that resolves with the ID of the selected file
   */
  this.showPicker = function(mimeTypes) {
    return googleApi.then(function(gapi) {
      var deferred = $q.defer();
      var view = new google.picker.DocsView;
      view.setIncludeFolders(true)
        .setParent('root');
      if (mimeTypes) {
        view.setMimeTypes(mimeTypes.join());
      }
      var picker = new google.picker.PickerBuilder()
        .setAppId(applicationId)
        .setOAuthToken(gapi.auth.getToken().access_token)
        .addView(view)
        .setCallback(function(data) {
          if (data.action == google.picker.Action.PICKED) {
            var item = data.docs[0];
            deferred.resolve(item.id);
            
          } else if (data.action == google.picker.Action.CANCEL) {
            deferred.reject();
          }
        })
        .build();
      picker.setVisible(true);
      return deferred.promise;
    });
  };

  /**
   * Displays the Drive sharing dialog
   *
   * @param {String} id ID of the file to share
   */
  this.showSharing = function(id) {
    return googleApi.then(function(gapi) {
      var deferred = $q.defer();
      var share = new gapi.drive.share.ShareClient(applicationId);
      share.setOAuthToken(gapi.auth.getToken().access_token);
      share.setItemIds([id]);
      share.showSettingsDialog();
      return deferred.promise;
    });
  };

}]);
