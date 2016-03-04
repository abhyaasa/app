'use strict';

angular.module('app')

.controller('DeckController', function ($scope, Deck) {
    $scope.Deck = Deck;

    $scope.getCount = function (key) {
        return (Deck.count && (key in Deck.count)) ? Deck.count[key] : 0;
    };

    // adapted from http://ionden.com/a/plugins/ion.rangeSlider/demo_interactions.html
    $(document).ready(function () {
        var $range = $('#range');
        var $result = $('#range');
        var track = function (data) {
            delete data.input;
            delete data.slider;
            $result.html(JSON.stringify(data, null, 2));
        };
        $range.ionRangeSlider({
            type: 'double',
            min: 1000,
            max: 5000,
            from: 2000,
            to: 4000,
            step: 100,
            onStart: track,
            onChange: track,
            onFinish: track,
            onUpdate: track
        });
    });
    // TODO manage filter controls
})

.controller('DeckHelpController', function () {})

.service('Deck', function (Log, $state, $rootScope, settings, getData, Library, _,
    LocalStorage) {
    var _this = this;
    this.count = undefined; // maintained by this.setCount()

    var setupQuestions = function (fileName) {
        return getData('flavor/library/' + fileName).then(function (promise) {
            _this.questions = promise.data;
        });
    };

    this.setupClosedDeck = function (deckName) {
        var copy = function (obj) {
            return _.mapObject(obj, function (val) {
                return _.clone(val);
            });
        };
        var indices = function (questions) {
            var indices = _.range(0, questions.length);
            if (settings.randomQuestions) {
                indices = _.sample(indices, indices.length);
            }
            return indices;
        };
        Log.debug('Deck setup', JSON.stringify(deckName));
        setupQuestions(deckName.file).then(function () {
            var numbers = _this.questions.map(function (q) {
                if (q.number === undefined) {
                    q.number = 0;
                }
                return q.number;
            });
            var min = _.min(numbers);
            var max = _.max(numbers);
            _this.data = {
                name: deckName,
                history: _.map(_this.questions, function () {
                    return [];
                }),
                range: min === max ? false : {
                    min: min,
                    max: max
                },
                tags: {
                    required: [],
                    excluded: [],
                    included: []
                },
                reverseQandA: false,
                active: indices(_this.questions),
                activeCardIndex: undefined // current card active index list pointer
            };
            _this.data.outcomes = new Array(_this.data.active.length);
            _this.save();
            $state.go('tabs.card');
        });
    };

    this.setupOpenDeck = function (displayName) {
        _this.data = LocalStorage.getObject(displayName);
        setupQuestions(_this.data.name.file).then(function () {
            $state.go('tabs.card');
        });
    };

    this.reset = function () {
        if (_this.data) {
            Library.resetDeck(_this.data.name);
            _this.data = undefined;
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
        _this.data.activeCardIndex = undefined;
        _this.save();
        $state.go('tabs.card');
    };

    this.enterTab = function () {
        var multiset = function (array) {
            var ms = {
                remaining: 0
            };
            array.map(function (value) {
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
            _this.count = multiset(_this.data.outcomes);
            _this.count.remaining = _.filter(_this.data.outcomes, isUndefined).length;
        }
    };
});
