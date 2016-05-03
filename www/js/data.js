'use strict';

/* eslint-env node */
/* eslint no-console: 0 */

var appGlobals = {}; // REVIEW global appGlobals

angular.module('data', ['ionic'])

/**
 * @name getData
 * @param {string} path to file, relative to www/data
 * @param {function} optional callback accepts error object
 * @returns {object} promise yielding json file contents
 */
.provider('getData', function () {
    var injector = angular.injector(['ng']);
    var $http = injector.get('$http');
    var urlPrefix = ''; // works in all iOS contexts
    // Android Ionic View app does not use Android prefix
    if (ionic.Platform.isAndroid()) {
        var href = window.location.href;
        if (href.indexOf('viewapp') !== -1) { // Ionic View
            urlPrefix = href.substr(0, href.indexOf('index.html'));
        } else if (href.indexOf('localhost') !== -1) { // Ionic server
            urlPrefix = '';
        } else {
            urlPrefix = '/android_asset/www/';
        }
    }
    appGlobals.urlPrefix = urlPrefix;
    // ANDROID in Ionic View empty prefix does not work
    this.$get = function () {
        return function (path, failure) {
            return $http.get(urlPrefix + 'data/' + path)
                .catch(function (error) {
                    if (failure) {
                        return failure(error);
                    } else {
                        console.error('getData', JSON.stringify(error), urlPrefix);
                        return error;
                    }
                });
        };
    };
});
