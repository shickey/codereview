'use strict';

var module = angular.module('gapi_user', ['gapi']);

module.service('gapi_user', ['$q', '$cacheFactory', 'googleApi', function($q, $cacheFactory, googleApi) {
  
  var user = undefined;
  var permissions = $cacheFactory('permissions');
  
  var USER_FIELDS = 'email,family_name,given_name,hd,id,name,picture';
  var PERMISSION_FIELDS = 'additionalRoles,domain,emailAddress,id,kind,name,role,type,value,withLink';
  
  this.fetchUser = function() {
    if (user) {
      return $q.when(user);
    }
    return googleApi.then(function(gapi) {
      var userRequest = gapi.client.oauth2.userinfo.get({
        fields: USER_FIELDS
      });
      return $q.when(userRequest);
    }).then(function(response) {
      user = JSON.parse(response.body);
      return user;
    });
  };
  
  this.fetchPermissionId = function() {
    if (user && user.permissionId) {
      return $q.when(permissionId);
    };
    return this.fetchUser().then(function(user) {
      console.log(user);
      var email = user.email;
      return googleApi.then(function(gapi) {
        var permissionIdRequest = gapi.client.drive.permissions.getIdForEmail({
          email: email
        });
        return $q.when(permissionIdRequest);
      }).then(function(response) {
        var permissionId = JSON.parse(response.body).id;
        user.permissionId = permissionId;
        return user.permissionId;
      });
    });
  };
  
  this.permissionsForFile = function(fileId) {
    var permission = permissions.get(fileId);
    if (permission) {
      return $q.when(permission);
    }
    return this.fetchPermissionId().then(function(permissionId) {
      
      return googleApi.then(function(gapi) {
        var permissionRequest = gapi.client.drive.permissions.get({
          fields: PERMISSION_FIELDS,
          fileId: fileId,
          permissionId: permissionId
        });
        return $q.when(permissionRequest);
      }).then(function(response) {
        var permission = JSON.parse(response.body);
        permissions.put(fileId, permission);
        return permission;
      });
    });
  };
  
}]);