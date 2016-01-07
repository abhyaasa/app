'use strict';

angular.module('app')

.controller('DeckController', function ($scope, Deck) {
    $scope.Deck = Deck;

    $scope.getCount = function (key) {
        return (Deck.count && (key in Deck.count)) ? Deck.count[key] : 0;
    };
    // TODO manage filter controls
})

.controller('DeckHelpController', function () {})

.service('Deck', function ($log, $state, $rootScope, settings, getData, Library, _,
  LocalStorage) {
    var Deck = this;
    this.reverseQandA = false;
    this.count = undefined; // maintained by this.setCount()

    var setupQuestions = function (fileName) {
        return getData('flavor/library/' + fileName).then(function (promise) {
            Deck.questions = promise.data;
        });
    };

    this.setupClosedDeck = function (deckName) {
        var initialFilterSettings = {
            max: 50,
            min: 50,
            required: [],
            exclude: [],
            include: []
        };
        var copy = function (obj) {
            return _.mapObject(obj, function (val) { return _.clone(val); });
        };
        var filter = function (questions) {
            // returns list of indices of questions that pass filter
            // TODO use filter settings
            var indices = _.range(0, questions.length);
            if (settings.randomQuestions) {
                indices = _.sample(indices, indices.length);
            }
            return indices;
        };
        $log.debug('Deck setup', JSON.stringify(deckName));
        setupQuestions(deckName.file).then(function () {
            Deck.data = {
                name: deckName,
                history: _.map(Deck.questions, function () { return []; }),
                filter: copy(initialFilterSettings),
                reverse: false, // TODO reverse Q&A
                active: filter(Deck.questions), // indices of active quesitons
                activeCardIndex: undefined, // current card active index list pointer
                done: false
            };
            Deck.data.outcomes = new Array(Deck.data.active.length);
            Deck.save();
            $state.go('tabs.card');
        });
    };

    this.setupOpenDeck = function (displayName) {
        Deck.data = LocalStorage.getObject(displayName);
        setupQuestions(Deck.data.name.file).then(function () {
            $state.go('tabs.card');
        });
    };

    this.reset = function () {
        if (Deck.data) {
            Library.resetDeck(Deck.data.name);
            Deck.data = undefined;
        }
    };

    this.save = function () {
        Library.saveDeck(Deck.data.name.display, Deck.data);
    };

    this.outcome = function (qid, outcome) {
        Deck.data.outcomes[Deck.data.activeCardIndex] = outcome;
        Deck.data.history[qid].push(outcome);
        Deck.save();
    };

    this.restart = function (restoreRemoved) {
        if (restoreRemoved) {
            Deck.data.outcomes = new Array(Deck.data.active.length);
        } else {
            Deck.data.outcomes = _.map(Deck.data.outcomes, function (outcome) {
                return outcome === 'removed' ? 'removed' : undefined;
            });
        }
        Deck.data.activeCardIndex = undefined;
        Deck.save();
        $state.go('tabs.card');
    };

    this.enterTab = function () {
        var multiset = function (array) {
            var ms = {remaining: 0};
            array.map(function (value) {
                if (_.has(ms, value)) {
                    ms[value] += 1;
                } else {
                    ms[value] = 1;
                }
            });
            return ms;
        };
        var isUndefined = function(value) {
            return value === undefined;
        };
        if (Deck.data) {
            Deck.count = multiset(Deck.data.outcomes);
            Deck.count.remaining = _.filter(Deck.data.outcomes, isUndefined).length;
        }
    };
})
;
