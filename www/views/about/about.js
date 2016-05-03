'use strict';

/* eslint no-undef: 0 */ // for appGlobals

angular.module('app')

.controller('AboutController', function ($scope, mode) {
    if (mode === 'debug') {
        $scope.debugInfo = {
            platforms: ionic.Platform.platforms,
            grade: ionic.Platform.grade,
            device: ionic.Platform.device(),
            isWebView: ionic.Platform.isWebView(),
            location: window.location.href,
            appGlobals: appGlobals
        };
    }
});
