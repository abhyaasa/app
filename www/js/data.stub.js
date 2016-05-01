'use strict';

/* eslint-env node */
/* eslint no-console: 0 */

angular.module('dataStub', ['ionic'])

.constant('httpStubData', {
    'config.json': {
        flavor: 'test',
        email: 'abhyaasa108@gmail.com',
        href: 'https://github.com/abhyaasa/app',
        name: 'Abhyaasa',
        version: '0.0.2'
    },
    'flavor/library/index.json': [
        'deck.json'
    ],
    'flavor/library/deck.json': [{
        'date': '2016-03-26',
        'sanskrit': true
    }, {
        'id': 0,
        'tags': [
            '.html'
        ],
        'text': [
            '<strong>bold html markup</strong>'
        ],
        'type': 'mind',
        'answer': ['some answer']
    }]
})

.provider('getData', function (httpStubData) {
    var injector = angular.injector(['ng']);
    var $q = injector.get('$q');
    this.$get = function () {
        return function (path) {
            // REVIEW create stub getData (normal one w/o $q) that includes
            // httpStubData and use constant load switch in app.js provider
            var data = httpStubData[path];
            var deferred = $q.defer();
            deferred.resolve({
                data: data
            });
            console.log('STUB LOG: getData', path, deferred.promise.data);
            return deferred.promise;
        };
    };
});
