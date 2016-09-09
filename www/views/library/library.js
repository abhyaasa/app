'use strict';

angular.module('app')

.controller('LibraryController', function ($rootScope, $scope, $state, _, mode,
    Library, Deck, Card, indexPromise) {
    $scope.selectClosedDeck = function (deckName) {
        Deck.setupClosedDeck(deckName);
    };

    /* An open deck has state saved in Deck.data. */
    $scope.selectOpenDeck = function (displayName) {
        Card.question = undefined;
        Deck.setupOpenDeck(displayName);
    };

    Library.provideIndex(indexPromise);
    $scope.deckLists = Library.deckLists;

    if (Library.numDecks() === 1 && mode !== 'debug') {
        $rootScope.config.hideLibrary = true;
        if (Library.decklists.open.length > 1) {
            Deck.setupOpenDeck($scope.deckLists.open[0]);
        } else {
            Deck.setupClosedDeck($scope.Decklists.closed[0]);
        }
    }
})

.service('Library', function (Log, $state, LocalStorage, _) {
    var _this = this;
    var openDecks;
    var fileDecks;

    this.provideIndex = function (indexPromise) {
        var indexNames = indexPromise.data;
        Log.debug('indexNames', indexNames);
        fileDecks = _.map(indexNames, function (name) {
            return {
                file: name,
                // discard suffix and replace _ characters with spaces
                display: name.match(/.*(?=\.)/)[0].replace(/_/g, ' ')
            };
        });
        _this.updateDeckLists();
    };

    this.deckLists = {
        open: undefined,
        closed: undefined
    };

    this.updateDeckLists = function () {
        if (openDecks === undefined) {
            openDecks = LocalStorage.getObject('*openDecks*');
            if (openDecks.length === undefined) {
                openDecks = [];
            }
            Log.debug('openDecks', JSON.stringify(openDecks));
        }
        var isOpen = function (fd) {
            return _.contains(openDecks, fd.display);
        };
        _this.deckLists.open = openDecks.sort();
        _this.deckLists.closed = _.reject(fileDecks, isOpen).sort();
        Log.debug('deckLists', JSON.stringify(_this.deckLists));
    };

    this.numDecks = function () {
        return _this.deckLists.open.length + _this.deckLists.closed.length;
    };

    this.saveDeck = function (displayName, data) {
        if (!_.contains(openDecks, displayName)) {
            openDecks.push(displayName);
            LocalStorage.setObject('*openDecks*', openDecks);
        }
        LocalStorage.setObject(displayName, data);
    };

    this.resetDeck = function (deckName) {
        openDecks = _.without(openDecks, deckName.display);
        LocalStorage.setObject('*openDecks*', openDecks);
        LocalStorage.remove(deckName.display);
    };

    this.resetAllDecks = function () {
        _.forEach(openDecks, function (deckName) {
            LocalStorage.remove(deckName.display);
        });
        openDecks = [];
        LocalStorage.setObject('*openDecks*', openDecks);
        $state.go('tabs.settings');
    };
});
