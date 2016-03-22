'use strict';

angular.module('app')

.controller('DeckController', function ($scope, $state, Deck, Log) {
    $scope.Deck = Deck;
    $scope.$state = $state;

    $scope.getCount = function (key) {
        return Deck.count && (key in Deck.count) ? Deck.count[key] : 0;
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

.service('Deck', function (Log, $state, $rootScope, settings, getData, Library, _,
    LocalStorage, $filter) {
    var _this = this;

    var filterTagsProto = {
        include: [],
        exclude: [],
        require: []
    };

    var countKeys = 'right wrong skipped removed hints remaining'.split(' ');

    this.isDefined = false;

    this.count = _.object(countKeys, _.map(_.range(countKeys.length), _.constant(0)));

    this.filterTagsKeys = _.keys(filterTagsProto);

    this.tagFilterText = _.mapObject(filterTagsProto, _.constant(''));

    this.updateFilterText = function () {
        _.mapObject(_this.data.filterTags, function (tags, key) {
            _this.tagFilterText[key] = (tags.length === 0 ?
                'Edit to ' + key + ' only cards with selected tags' :
                $filter('capitalize')(key) + ' tags: ' + tags.join(', '));
        });
    };

    this.filterNormalTags = function (tags) {
        return _.filter(tags, function (tag) {
            return tag.charAt(0) !== '.';
        });
    };

    var qNumber = function (q) {
        return q.number === undefined ? 0 : q.number;
    };

    // Randomize within each group of indices separated by text-type question indices.
    var randomizeIndices = function (questions) {
        var indices = [];
        var group = [];
        for (var q in questions) {
            if (q.type === 'text') {
                indices = indices.concat(_.sample(group, group.length));
                group = [];
                indices.push(q.id);
            } else {
                group.push(q.id);
            }
        }
        return indices.concat(_.sample(group, group.length));
    };

    this.activeIndices = function () {
        var filterTags = _this.data.filterTags;
        var questions = _.filter(_this.questions, function (q) {
            return ((filterTags.include.length === 0 ||
                    _.intersection(filterTags.include, q.tags).length > 0) &&
                _.intersection(filterTags.exclude, q.tags).length === 0 &&
                _.difference(filterTags.require, q.tags).length === 0 &&
                _this.data.range.max >= qNumber(q) &&
                _this.data.range.min <= qNumber(q));
        });
        var indices = _.pluck(questions, 'id');
        if (settings.randomQuestions) {
            indices = randomizeIndices(questions);
        }
        _this.updateFilterText();
        if (indices.length === 0) {
            return false;
        } else {
            _this.data.active = indices;
            Log.debug('indices', indices);
            _this.restart(true);
            return true;
        }
    };

    var setupQuestions = function (fileName) {
        return getData('flavor/library/' + fileName).then(function (promise) {
            _this.questions = promise.data;
        });
    };

    var finishSetup = function () {
        _this.data.range.options.onEnd = function (id, newMin, newMax) {
            _this.activeIndices();
        };
        _this.isDefined = true;
        $state.go('tabs.card');
    };

    this.setupClosedDeck = function (deckName) {
        var copy = function (obj) {
            return _.mapObject(obj, function (val) {
                return _.clone(val);
            });
        };
        Log.debug('Deck setup', JSON.stringify(deckName));
        setupQuestions(deckName.file).then(function () {
            var numbers = _.map(_this.questions, qNumber);
            var min = _.min(numbers);
            var max = _.max(numbers);
            var allTags = _.uniq(_.flatten(_.pluck(_this.questions, 'tags'))).sort();
            _this.data = {
                name: deckName,
                history: _.map(_this.questions, function () {
                    return [];
                }),
                range: min === max ? false : {
                    min: min,
                    max: max,
                    options: {
                        floor: min,
                        ceil: max
                    }
                },
                showTags: false,
                tags: _this.filterNormalTags(allTags),
                filterTags: _.clone(filterTagsProto),
                reverseQandA: false,
                activeCardIndex: undefined, // initially assigned by Card.setup()
                active: undefined, // assigned by _this.activeIndices()
                outcomes: undefined // assigned by _this.restart()
            };
            _this.activeIndices();
            _this.save();
            finishSetup();
        });
    };

    this.setupOpenDeck = function (displayName) {
        _this.data = LocalStorage.getObject(displayName);
        setupQuestions(_this.data.name.file).then(finishSetup);
    };

    this.reset = function () {
        if (_this.data) {
            Library.resetDeck(_this.data.name);
            _this.isDefined = false;
        }
    };

    this.save = function () {
        Library.saveDeck(_this.data.name.display, _this.data);
    };

    this.outcome = function (qid, outcome) {
        _this.data.outcomes[_this.data.activeCardIndex] = outcome;
        _this.data.history[qid].push(outcome);
        _this.save();
    };

    this.restart = function (restoreRemoved) {
        if (restoreRemoved) {
            _this.data.outcomes = new Array(_this.data.active.length);
        } else {
            _this.data.outcomes = _.map(_this.data.outcomes, function (outcome) {
                return outcome === 'removed' ? 'removed' : undefined;
            });
        }
        _this.data.activeCardIndex = 0;
        _this.save();
        _this.enterTab();
    };

    this.enterTab = function () {
        var multiset = function (outcomes) {
            var ms = {
                remaining: 0
            };
            outcomes.map(function (value) {
                if (_.has(ms, value)) {
                    ms[value] += 1;
                } else {
                    ms[value] = 1;
                }
            });
            return ms;
        };
        var isUndefined = function (value) {
            return value === undefined;
        };
        if (_this.data) {
            _.extendOwn(_this.count, multiset(_this.data.outcomes));
            _this.count.remaining = _.filter(_this.data.outcomes, isUndefined).length;
            // if (_this.data.range) { // HACK rzslider bug
            //     this.data.range.max = _this.data.range.max;
            // }
            _this.updateFilterText();
        }
    };
});
