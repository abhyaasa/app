'use strict';

// Jasmine unit tests
// REVIEW use Google Chrome Canary instead of chrome in progractor.conf.js

// TODO need to create mock for $hhtp.
// See http://stackoverflow.com/questions/26612156
// and https://www.airpair.com/angularjs/posts/unit-testing-angularjs-applications
// and http://gonehybrid.com/how-to-write-automated-tests-for-your-ionic-app-part-2/
xdescribe('getData', function () {
    var scope;
    beforeEach(module('services'));
    beforeEach(function () {
        inject(function ($rootScope) {
            scope = $rootScope.$new();
            // getData = $provider('getData', ... TODO finish
        });
    });

    it('invokes success handler with object represented in json file',
        // FIXME fails, if success, test failure also
        inject(function (getData) {
            var handler = jasmine.createSpy('success');
            getData('flavor/test.json').then(handler);
            scope.$digest();
            expect(handler).toHaveBeenCalledWith(['data', 'for unit test']);
        }));

    it('invokes fail handler when local json file does not exist',
        // FIXME fails, if success, test failure also
        inject(function ($log, getData) {
            var handler = jasmine.createSpy('success');
            getData('bogus.json', handler);
            scope.$digest();
            expect(handler).toHaveBeenCalledWith('XX');
        }));
});

describe('LocalStorage', function () {
    beforeEach(module('services'));
    it('stores and retrieves the same thing using the same test key',
        inject(function (LocalStorage) {
            LocalStorage.set('test key', 'test value');
            expect(LocalStorage.get('test key')).toEqual('test value');
            expect(LocalStorage.get('bogus key')).not.toBeDefined();
        }));
});
