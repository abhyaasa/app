'use strict';

angular.module('app')

.controller('DeckController', function ($scope, $state, Deck, settings) {
    // var primes = [ // Primes to over a year
    //     2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
    //     71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
    //     157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239,
    //     241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337,
    //     347, 349, 353, 359, 367
    // ];
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
