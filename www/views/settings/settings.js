'use strict';

angular.module('app')

.controller('SettingsController', function ($scope, settings) {
    $scope.settings = settings;
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
