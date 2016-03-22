'use strict';

angular.module('stubs', ['ionic'])

.constant('httpStubData', {
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
})

.provider('getStubData', function (httpStubData) {
    var injector = angular.injector(['ng']);
    var $http = injector.get('$http');
    var urlPrefix = ionic.Platform.isAndroid() ? '/android_asset/www/' : '';
    var $q = injector.get('$q');
    this.$get = function () {
        return function (path, failure) {
            // REVIEW create stub getData (normal one w/o $q) that includes
            // httpStubData and use constant load switch in app.js provider
            if (httpStubData) {
                var data = httpStubData[path];
                var deferred = $q.defer();
                deferred.resolve({
                    data: data
                });
                console.log('STUB LOG: getStubData', path, deferred.promise.data);
                return deferred.promise;
            }
        };
    };
});