'use strict';

// Jasmine unit tests

describe('Deck', function () {
    var deck;
    beforeEach(module('app'));
    beforeEach(function () {
        inject(function (Deck) {
            deck = Deck;
        });
    });

    // TODO complete rewrite of following borrowed from services.uspec.js

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
