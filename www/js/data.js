'use strict';

/* eslint-env node */
/* eslint no-console: 0 */

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
    var urlPrefix = ionic.Platform.isAndroid() ? '/android_asset/www/' : '';
    this.$get = function () {
        return function (path, failure) {
            return $http.get(urlPrefix + 'data/' + path)
                .catch(function (error) {
                    if (failure) {
                        return failure(error);
                    } else {
                        console.error('getData', JSON.stringify(error));
                        return error;
                    }
                });
        };
    };
});
