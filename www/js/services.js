'use strict';

var httpStubData = { // REVIEW global httpStubData
    'config.json': {
        flavor: 'test',
        email: 'abhyaasa108@gmail.com',
        href: 'https://github.com/abhyaasa/app',
        name: 'Abhyaasa',
        version: '0.0.2'
    },
    'flavor/library/index.json': [
        'deck.json',
        'deck_2.json'
    ],
    'flavor/library/deck.json': [{
        answer: 'Ci',
        id: 0,
        tags: [
            '.ci'
        ],
        text: 'case insensitive',
        type: 'mind'
    }, {
        answer: '<p>Buddy at shelter</p>',
        id: 1,
        tags: [
            '.html'
        ],
        text: '<p>image <img alt="Buddy"src="data/flavor/media/deck_2/buddyShelter.jpg"' +
            ' title="Buddy at shelter" /></p>',
        type: 'mind'
    }]
};
httpStubData = false;

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
    var urlPrefix = ionic.Platform.isAndroid() ? '/android_asset/www/' : '';
    var $q = injector.get('$q');
    this.$get = function () {
        return function (path, failure) {
            $log.debug('getData path', path);
            if (httpStubData) { // XXX stub getData
                var data = httpStubData[path];
                var deferred = $q.defer();
                deferred.resolve({ data: data });
                $log.debug(data, 'and promise.data', deferred.promise.data);
                return deferred.promise;
            }
            return $http.get(urlPrefix + 'data/' + path)
                .catch(function (error) {
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

// MediaSrv and following window.Media adopted from
// http://forum.ionicframework.com/t/how-to-play-local-audio-files/7479/5
// $ cordova plugin add org.apache.cordova.media
// Also see mawarnes version in forum thread above, and the thread indicates that
// Android needs:
//      android.permission.WRITE_EXTERNAL_STORAGE
//      android.permission.RECORD_AUDIO
//      android.permission.MODIFY_AUDIO_SETTINGS
//      android.permission.READ_PHONE_STATE
.factory('MediaSrv', function ($q, $ionicPlatform, $window, $log) {
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

    function _logError(src, err) {
        $log.error('media error', {
            code: err.code,
            message: getErrorMessage(err.code)
        });
    }

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

    function playSound(mp3File) {
        loadMedia(mp3File).then(function (media) {
            // Don't want iOS default, which ignores mute button, see
            // https://www.npmjs.com/package/cordova-plugin-media
            media.play({
                playAudioWhenScreenIsLocked: false
            });
        });
    }

    return {
        loadMedia: loadMedia,
        getStatusMessage: getStatusMessage,
        getErrorMessage: getErrorMessage,
        playSound: playSound
    };
});

window.Media = function (src, mediaSuccess, mediaError, mediaStatus) {
    // REVIEW several media functions below are stubs
    // src: A URI containing the audio content. (DOMString)
    // mediaSuccess: (Optional) The callback that executes after a Media object has
    // completed the current play, record, or stop action. (Function)
    // mediaError: (Optional) The callback that executes if an error occurs. (Function)
    // mediaStatus: (Optional) The callback that executes to indicate status changes.
    // (Function)
    if (typeof Audio !== 'function' && typeof Audio !== 'object') {
        console.warn('HTML5 Audio is not supported in this browser');
    }
    var sound = new Audio();
    sound.src = src;
    sound.addEventListener('ended', mediaSuccess, false);
    sound.load();
    return {
        // Returns the current position within an audio file (in seconds).
        getCurrentPosition: function (mediaSuccess, mediaError) {
            mediaSuccess(sound.currentTime);
        },
        // Returns the duration of an audio file (in seconds) or -1.
        getDuration: function () {
            return isNaN(sound.duration) ? -1 : sound.duration;
        },
        // Start or resume playing an audio file.
        play: function () {
            sound.play();
        },
        // Pause playback of an audio file.
        pause: function () {
            sound.pause();
        },
        // Releases the underlying operating system's audio resources.
        // REVIEW Should be called on a ressource when it's no longer needed!
        release: function () {},
        // Moves the position within the audio file.
        seekTo: function (milliseconds) {},
        // Set the volume for audio playback (between 0.0 and 1.0).
        setVolume: function (volume) {
            sound.volume = volume;
        },
        // Start recording an audio file.
        startRecord: function () {},
        // Stop recording an audio file.
        stopRecord: function () {},
        // Stop playing an audio file.
        stop: function () {
            sound.pause();
            if (mediaSuccess) {
                mediaSuccess();
            }
        }
    };
};
