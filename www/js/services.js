'use strict';

angular.module('services', ['ionic'])

/**
 * Use x name as tag, attribute, class name, or after directive in comment.
 * The associated element is removed.
 */
.directive('x', function () {
    return {
        restrict: 'AE',
        compile: function (el) {
            el.remove();
        }
    };
})

.directive('hideTabs', function ($rootScope) {
    return {
        restrict: 'A',
        link: function ($scope) {
            $rootScope.hideTabs = 'tabs-item-hide';
            $scope.$on('$destroy', function () {
                // This needed in tabs.intro onExit function, maybe not here as in this
                // directive from http://codepen.io/toddhalfpenny/pen/bNyLYB?editors=1010
                $rootScope.hideTabs = '';
            });
        }
    };
})

.constant('mode', 'debug') // 'debug', 'build', or 'normal'

.constant('_', window._) // underscore.js access

/**
 * @name getData
 * @param {string} path to file, relative to www/data
 * @param {function} optional callback accepts error object
 * @returns {object} promise yielding json file contents
 */
.provider('getData', function () {
    var injector = angular.injector(['ng']);
    var $http = injector.get('$http');
    var $log = injector.get('$log');
    this.$get = function () {
        return function (path, failure) {
            return $http.get('/data/' + path).catch(
                function (error) {
                    if (failure) {
                        return failure(error);
                    } else {
                        $log.error('getData', JSON.stringify(error));
                    }
                });
        };
    };
})

// based on http://learn.ionicframework.com/formulas/localstorage/
/**
 * @name LocalStorage
 */
.service('LocalStorage', ['$window', function ($window) {
    /**
     * set value
     * @param {string} key
     * @param {object} value
     */
    this.set = function (key, value) {
        $window.localStorage[key] = value;
    };

    this.get = function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
    };

    this.setObject = function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
    };

    this.getObject = function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
    };

    this.remove = function (key) {
        $window.localStorage.removeItem(key);
    };

    this.clear = function () {
        $window.localStorage.clear();
    };
}])

// TODO test media service: Adapted from
// http://forum.ionicframework.com/t/how-to-play-local-audio-files/7479/5
// for media plugin :
// http://plugins.cordova.io/#/package/org.apache.cordova.media
// Usage:
//   MediaSrv.loadMedia('sounds/mysound.mp3').then(function (media) {
//    media.play();
//   });
// Also see mawarnes version in forum thread above
// Alternatives: https://www.npmjs.com/package/cordova-plugin-nativeaudio or
// http://goldfirestudios.com/blog/104/howler.js-Modern-Web-Audio-Javascript-Library
// nativeAudio problem with volume control
// https://blog.nraboy.com/2014/11/playing-audio-android-ios-ionicframework-app/
// http://www.gajotres.net/playing-native-audio-using-ionic-framework-and-cordova/
// https://github.com/arielfaur/ionic-audio
.factory('MediaSrv', function ($q, $ionicPlatform, $window, $log) {
    function loadMedia(src, onError, onStatus, onStop) {
        var defer = $q.defer();
        $ionicPlatform.ready(function () {
            var mediaSuccess = function () {
                if (onStop) {
                    onStop();
                }
            };
            var mediaError = function (err) {
                _logError(src, err);
                if (onError) {
                    onError(err);
                }
            };
            var mediaStatus = function (status) {
                if (onStatus) {
                    onStatus(status);
                }
            };

            if ($ionicPlatform.is('android')) {
                src = '/android_asset/www/' + src;
            }
            defer.resolve(new $window.Media(src, mediaSuccess, mediaError, mediaStatus));
        });
        return defer.promise;
    }

    function _logError(src, err) {
        $log.error('media error', {
            code: err.code,
            message: getErrorMessage(err.code)
        });
    }

    function getStatusMessage(status) {
        if (status === 0) {
            return 'Media.MEDIA_NONE';
        } else if (status === 1) {
            return 'Media.MEDIA_STARTING';
        } else if (status === 2) {
            return 'Media.MEDIA_RUNNING';
        } else if (status === 3) {
            return 'Media.MEDIA_PAUSED';
        } else if (status === 4) {
            return 'Media.MEDIA_STOPPED';
        } else {
            return 'Unknown status <' + status + '>';
        }
    }

    function getErrorMessage(code) {
        if (code === 1) {
            return 'MediaError.MEDIA_ERR_ABORTED';
        } else if (code === 2) {
            return 'MediaError.MEDIA_ERR_NETWORK';
        } else if (code === 3) {
            return 'MediaError.MEDIA_ERR_DECODE';
        } else if (code === 4) {
            return 'MediaError.MEDIA_ERR_NONE_SUPPORTED';
        } else {
            return 'Unknown code <' + code + '>';
        }
    }

    var service = {
        loadMedia: loadMedia,
        getStatusMessage: getStatusMessage,
        getErrorMessage: getErrorMessage
    };

    return service;
});
