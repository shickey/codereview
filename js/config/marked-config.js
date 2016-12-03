'use strict';

/**
 * @ngdoc overview
 * @name codeReviewApp
 * @description
 * # codeReviewApp
 *
 * Configuration for angular-marked
 */
angular.module('codeReviewApp')
  .config(['markedProvider', function(markedProvider) {
    markedProvider.setOptions({
      gfm: true,
      tables: true,
      highlight: function (code, lang) {
        if (lang) {
          return hljs.highlight(lang, code, true).value;
        } else {
          return hljs.highlightAuto(code).value;
        }
      }
    });
  }]);