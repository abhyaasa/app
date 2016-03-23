'use strict';

angular.module('app')

.controller('SettingsController', function ($scope, settings, _) {
    $scope.settings = settings;

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

.value('settings', {})

.service('saveSettings', function (Log, settings, LocalStorage, _) {
    return function () {
        LocalStorage.setObject('*settings*', settings);
        Log.debug('SAVED SETTINGS');
    };
})

.service('restoreSettings', function (Log, settings, LocalStorage, _) {
    var defaultSettings = {
        intro: true,
        randomQuestions: false,
        randomResponses: false,
        devanagari: false // XXX move to deck
    };
    return function (reset) {
        _.extendOwn(settings, defaultSettings);
        if (!reset) {
            var s = LocalStorage.getObject('*settings*');
            if (s !== undefined) {
                _.extendOwn(settings, s);
            }
        }
        Log.debug('restored settings', JSON.stringify(settings));
    };
});
