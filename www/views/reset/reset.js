'use strict';

angular.module('app')

.controller('ResetController', function ($scope, $state, Card, Deck, Library,
  restoreSettings, saveSettings, LocalStorage) {
    $scope.hideConfirm = true;
    $scope.hideWarning = true;
    $scope.selection = undefined;
    $scope.options = [
        { text: 'Reset current deck', value: 'deck', warning: 'deck', show: Deck.data },
        { text: 'Reset all decks', value: 'all decks', warning: 'deck', show: true },
        { text: 'Reset settings to defaults', value: 'settings', show: true },
        { text: 'Reset all user data', value: 'all data', warning: 'deck', show: true }
    ];

    $scope.selected = function (item) {
        $scope.selection = item.value;
        $scope.hideWarning = item.warning !== 'deck';
        $scope.hideConfirm = false;
    };

    $scope.confirmed = function () {
        if ($scope.selection === 'settings') {
            restoreSettings(true);
        } else if ($scope.selection === 'deck') {
            Card.reset();
        } else if ($scope.selection === 'all decks') {
            Card.resetAllDecks();
        } else if ($scope.selection === 'all data') {
            LocalStorage.clear();
            restoreSettings();
            Card.resetAllDecks();
        }
        $state.go('tabs.settings');
    };
});
