'use strict';

angular.module('app')

.controller('DeckController', function ($scope, $state, Deck, settings) {
    // XXX spaced repetition disable confirmation
    $scope.Deck = Deck;
    $scope.$state = $state;
    $scope.settings = settings;

    $scope.getCount = function (key) {
        return Deck.count && (key in Deck.count) ? Deck.count[key] : 0;
    };

    // Adapted from http://codepen.io/ionic/pen/uJkCz?editors=1010
    /*
     * If given group is the selected group, deselect it,
     * else select the given group.
     */
    $scope.toggleGroup = function (group) {
        Deck.data.isUIgroupShown[group] = !Deck.data.isUIgroupShown[group];
    };
})

.controller('DeckTagsController', function ($scope, $state, $stateParams, Deck, _) {
    var filterKey = $stateParams.filterKey;
    var tags = Deck.data.tags;
    var filterTags = Deck.data.filterTags;
    $scope.filterKey = filterKey;
    $scope.noCards = false;

    var setup = function () {
        $scope.tagObjects = _.map(tags, function (tag) {
            var tagObj = {
                tag: tag,
                value: undefined,
                disabled: false
            };
            _.mapObject(filterTags, function (tags, key) {
                var hasTag = _.contains(tags, tag);
                if (key === filterKey) {
                    tagObj.value = hasTag;
                } else {
                    tagObj.disabled = tagObj.disabled || hasTag;
                }
            });
            return tagObj;
        });
    };
    setup();

    $scope.save = function () {
        var selected = _.filter($scope.tagObjects, _.property('value'));
        var savedTags = filterTags[filterKey];
        filterTags[filterKey] = _.pluck(selected, 'tag');
        if (Deck.activeIndices()) {
            $state.go('tabs.deck');
        } else {
            filterTags[filterKey] = savedTags;
            $scope.noCards = true;
            setup();
        }
    };
})
;
