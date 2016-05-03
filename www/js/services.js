'use strict';

/* eslint no-console: 0 */
/* eslint no-alert: 0 */
/* eslint valid-jsdoc: 0 */
/* eslint require-jsdoc: 0 */

/* eslint no-undef: 0 */ // for appGlobals

angular.module('services', ['ionic'])

.constant('mode', 'debug') // 'debug', 'build', or 'normal'

.constant('_', window._) // underscore.js access

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

.filter('capitalize', function () {
    return function (input) {
        var haveInput = Boolean(input);
        return haveInput ? input.charAt(0).toUpperCase() +
            input.substr(1).toLowerCase() : '';
    };
})

/* Console Log, because $log does not work in xcode */
.service('Log', function (_, mode) {
    var logger = function (prefix, args) {
        console.log(prefix + ' LOG ' + args.map(JSON.stringify).join(' '));
    };
    this.log = function () {
        logger('', _.toArray(arguments));
    };

    this.debug = function () {
        if (mode === 'debug') {
            logger('Debug', _.toArray(arguments));
        }
    };

    this.error = function () {
        var args = _.toArray(arguments);
        window.alert('ERROR: ' + JSON.stringify(args));
        logger('ERROR', args);
    };
})

/**
 * @name LocalStorage
 * based on http://learn.ionicframework.com/formulas/localstorage/
 */
.service('LocalStorage', function ($window) {

    /**
     * Set local storage value.
     * @param {string} key identifies storage item
     * @param {object} value object to store
     * @returns {void}
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
})

// MediaSrv and following window.Media adopted from loicknuchel's post at
// http://forum.ionicframework.com/t/how-to-play-local-audio-files/7479/5
// org.apache.cordova.media => cordova.plugin.media
// Also see mawarnes version in forum thread above.
.factory('MediaSrv', function ($q, $ionicPlatform, $window, Log) {
    this.getErrorMessage = function (code) {
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
    };

    this._logError = function (src, err) {
        Log.error('media error', {
            code: err.code,
            message: this.getErrorMessage(err.code)
        });
    };

    this.loadMedia = function (src, onError, onStatus, onStop) {
        var defer = $q.defer();
        $ionicPlatform.ready(function () {
            var mediaSuccess = function () {
                if (onStop) {
                    onStop();
                }
            };
            var mediaError = function (err) {
                this._logError(src, err);
                if (onError) {
                    onError(err);
                }
            };
            var mediaStatus = function (status) {
                if (onStatus) {
                    onStatus(status);
                }
            };

            src = appGlobals.urlPrefix + src;
            defer.resolve(new $window.Media(src, mediaSuccess, mediaError, mediaStatus));
        });
        return defer.promise;
    };

    this.getStatusMessage = function (status) {
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
    };

    this.playSound = function (mp3File) {
        this.loadMedia(mp3File).then(function (media) {
            // Don't want iOS default, which ignores mute button, see
            // https://www.npmjs.com/package/cordova-plugin-media
            media.play({
                playAudioWhenScreenIsLocked: false
            });
        });
    };

    return this;
});

// BUILD needed for browser testing, but ignored on device
window.Media = function (src, mediaSuccess) {
    // Several media functions below are stubs.
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
        getCurrentPosition: function (mediaSuccess) {
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
        // Should be called on a ressource when it's no longer needed!
        release: function () {},
        // Moves the position within the audio file.
        seekTo: function () {},
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
