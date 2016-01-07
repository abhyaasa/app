'use strict';

// TODO ibook 235 itest
describe('Library View', function () {
    browser.get('http://localhost:8100/');
    var searchText = element(by.model('model.searchText'));

    it('should open to the library view', function () {
        expect(searchText.getText()).toBe('');
    });
});
