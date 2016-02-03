'use strict';

angular.module('app')

.controller('LibraryController', function ($rootScope, $scope, $state, $log, _, mode,
  Library, Deck, Card, indexPromise) {
    $scope.selectClosedDeck = function(deckName) {
        Deck.setupClosedDeck(deckName);
    };

    $scope.selectOpenDeck = function (displayName) {
        Card.question = undefined;
        Deck.setupOpenDeck(displayName);
    };

    Library.provideIndex(indexPromise);
    $scope.deckLists = Library.deckLists; // TODO filtering here

    if (Library.numDecks() === 1 && mode !== 'debug') {
        $rootScope.config.hideLibrary = true;
        if (Library.decklists.open.length > 1) {
            Deck.setupOpenDeck($scope.deckLists.open[0]);
        } else {
            Deck.setupClosedDeck($scope.Decklists.closed[0]);
        }
    }

    // TODO implement search, Ionic in action 6.3, p 140
    // try AngularJS cookbook p 64 http://jsfiddle.net/msfrisbie/ghsa3nym/
    // angular.extend($scope, {
    //     model: {searchText: ''}, // used in itest
    //     search: function () {
    //         $scope.deckList = _.filter(allDeckNames, function(deckName) {
    //             var name = deckName.display.toLowerCase;
    //             return name.indexOf($scope.model.searchText.toLowerCase) !== -1;
    //         });
    //     },
    //     clearSearch: function () {
    //         $scope.deckList = allDeckNames;
    //         $scope.model.searchText = '';
    //     }
    // });
})

.controller('LibraryHelpController', function () {})

.service('Library', function ($log, $state, getData, LocalStorage, _) {
    var Library = this;

    var openDecks = LocalStorage.getObject('*openDecks*');
    if (openDecks.length === undefined) {
        openDecks = [];
    }
    $log.debug('openDecks', JSON.stringify(openDecks));

    this.deckLists = { open: undefined, closed: undefined };
    this.updateDeckLists = function () {
        var isOpen = function (fd) {
            return _.contains(openDecks, fd.display);
        };
        Library.deckLists.open = openDecks.sort();
        Library.deckLists.closed = _.reject(fileDecks, isOpen).sort();
        $log.debug('deckLists', JSON.stringify(Library.deckLists));
    };
    this.numDecks = function () {
        return Library.deckLists.open.length + Library.deckLists.closed.length;
    };

    var fileDecks;
    this.provideIndex = function (indexPromise) {
        var indexNames = indexPromise.data;
        $log.debug('indexNames', indexNames);
        fileDecks =_.map(indexNames, function (name) {
            return {
                file: name,
                // discard suffix and replace _ characters with spaces
                display: name.match(/.*(?=\.)/)[0].replace(/_/g, ' ')
            };
        });
        Library.updateDeckLists();
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
    };
})
;
