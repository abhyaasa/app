'use strict';

angular.module('app')

.controller('SettingsController', function ($scope, settings, MediaSrv) {
    $scope.settings = settings;

    $scope.playSound = function () { // FIXME test sound button
        MediaSrv.loadMedia('data/flavor/media/sound/Omkara.mp3').then(function (media) {
            // Don't want iOS default, which ignores mute button,
            // see https://www.npmjs.com/package/cordova-plugin-media
            media.play({ playAudioWhenScreenIsLocked: false });
        });
    };

    // // from http://docs.ionic.io/v1.0/docs/deploy-install
    // // FUTURE implement and test deploy
    // var deploy = new Ionic.Deploy();
    // // Update app code with new release from Ionic Deploy
    // $scope.doUpdate = function () {
    //     deploy.update().then(function (res) {
    //         console.log('Ionic Deploy: Update Success! ', res);
    //     }, function (err) {
    //         console.log('Ionic Deploy: Update error! ', err);
    //     }, function (prog) {
    //         console.log('Ionic Deploy: Progress... ', prog);
    //     });
    // };
    // // Check Ionic Deploy for new code
    // $scope.checkForUpdates = function () {
    //     console.log('Ionic Deploy: Checking for updates');
    //     deploy.check().then(function (hasUpdate) {
    //         console.log('Ionic Deploy: Update available: ' + hasUpdate);
    //         $scope.hasUpdate = hasUpdate;
    //     }, function (err) {
    //         console.error('Ionic Deploy: Unable to check for updates', err);
    //     });
    // };
})

.controller('SettingsHelpController', function () {})

.value('settings', {})

.service('saveSettings', function ($log, settings, LocalStorage, _) {
    return function () {
        var s = {};
        _.extendOwn(s, settings);
        LocalStorage.setObject('*settings*', s);
        $log.debug('SAVED SETTINGS');
    };
})

.service('restoreSettings', function ($log, settings, LocalStorage, _) {
    var defaultSettings = {
        intro: true,
        randomQuestions: false,
        randomResponses: false,
        devanagari: false,
        hintPercent: 10
    };
    return function (reset) {
        _.extendOwn(settings, defaultSettings);
        if (!reset) {
            var s = LocalStorage.getObject('*settings*');
            if (s !== undefined) {
                _.extendOwn(settings, s);
            }
        }
        $log.debug('restored settings', JSON.stringify(settings));
    };
});
