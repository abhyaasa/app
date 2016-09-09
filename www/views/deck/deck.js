'use strict';

angular.module('app')

.service('Deck', function (Log, $state, $rootScope, settings, getData, Library, _,
    LocalStorage, $filter) {
    var _this = this;

    var filterTagsPrototype = {
        include: [],
        exclude: [],
        require: []
    };

    var defaultHeader = {
        '.sanskrit': false
    };

    var countKeys = 'right wrong skipped removed hints remaining'.split(' ');

    /**
     * Retrieves state of open deck.
     * @param  {[type]} fileName [description]
     * @return {undefined}
     */
    var setupQuestions = function (fileName) {
        _this.settingUp = true;
        return getData('flavor/library/' + fileName).then(function (promise) {
            _this.questions = promise.data;
            _this.header = _.clone(defaultHeader);
            if ('date' in _this.questions[0]) {
                _.extendOwn(_this.header, _this.questions[0]);
                _this.questions.splice(0, 1);
            }
            _this.headerDisplayKeys = _.filter(_.keys(_this.header).sort(),
                function (key) {
                    return key[0] !== '.';
                });
            _.each(_this.questions, function (q, index) {
                q.index = index;
            });
        });
    };

    var qNumber = function (q) {
        return q.number === undefined ? 0 : q.number;
    };

    var updateFilterText = function () {
        _.mapObject(_this.data.filterTags, function (tags, key) {
            _this.tagFilterText[key] = (tags.length === 0 ?
                'Edit to ' + key + ' only cards with selected tags' :
                $filter('capitalize')(key) + ' tags: ' + tags.join(', '));
        });
    };

    // Randomize within each group of questions, separated by text-type questions.
    var randomizeQData = function () {
        var qData = [];
        var group = [];
        for (var qd in _this.data.qData) {
            if (_this.questions[qd.index].type === 'text') {
                qData = qData.concat(_.sample(group, group.length));
                group = [];
                qData.push(qd);
            } else {
                group.push(qd);
            }
        }
        _this.data.qData = qData.concat(_.sample(group, group.length));
    };

    var filterQuestions = function () {
        var filterTags = _this.data.filterTags;
        var questions = _.filter(_this.questions, function (q) {
            return ((filterTags.include.length === 0 ||
                    _.intersection(filterTags.include, q.tags).length > 0) &&
                _.intersection(filterTags.exclude, q.tags).length === 0 &&
                _.difference(filterTags.require, q.tags).length === 0 &&
                _this.data.range.max >= qNumber(q) &&
                _this.data.range.min <= qNumber(q));
        });
        var indices = _.pluck(questions, 'index');
        Log.debug('indices', indices);
        _.each(_this.data.qData, function (qd) {
            qd.passFilter = _.contains(indices, qd.id);
        });
        updateFilterText();
        return indices.length !== 0;
    };

    var finishSetup = function () {
        if (_this.data.haveRange) {
            _this.data.range.options.onEnd = function () {
                filterQuestions();
            };
        }
        _this.beginSession();
        _this.isDefined = true;
        _this.settingUp = false;
        _this.save();
        $state.go('tabs.card');
    };

    // State of open deck, initialized by this.setupClosedDeck() and saved by this.save().
    this.data = undefined;

    // Do not display deck or card info until this.finishSetup() assigns true.
    // Also set false by this.reset().
    this.isDefined = false;

    // spaced repetition interval choices are primes to over a year
    this.intervalChoices = [
        1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
        71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
        157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239,
        241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337,
        347, 349, 353, 359, 367
    ];

    // count object attributes are various deck card counts, initialized to 0.
    this.count = _.object(countKeys, _.map(_.range(countKeys.length), _.constant(0)));

    this.filterTagsKeys = _.keys(filterTagsPrototype);

    this.tagFilterText = _.mapObject(filterTagsPrototype, _.constant(''));

    this.filterNormalTags = function (tags) {
        return _.filter(tags, function (tag) {
            return tag.charAt(0) !== '.';
        });
    };

    this.restoreRemoved = function () {
        _.each(_this.data.qData, function (qd) {
            qd.removed = false;
        });
    };

    this.beginSession = function () {
        _.each(_this.data.qData, function (qd) {
            _.extendOwn(qd, {
                passFilter: undefined, // set by filterQuestions()
                outcome: undefined, // right, wrong, undefined (skipped), removed
                hints: 0,
                wrong: 0
            });
        });
        filterQuestions();
        _this.data.cardIndex = 0;
        if (settings.randomQuestions) {
            randomizeQData();
        }
        _this.data.sessionDone = false;
        _this.data.sessionNumber += 1;
        _this.save();
        _this.enterTab();
        $state.go('tabs.card');
    };

    this.endSession = function () {
        var nextInterval = function (interval) {
            var dri = _this.data.intervals;
            for (var i = 0; i < dri.length; i++) {
                if (dri[i] > interval) {
                    return dri[i - 1];
                }
            }
            return dri[dri.length - 1];
        };
        _.each(_this.data.qData, function (qd) {
            for (var i = 0; i < qd.wrong; i++) {
                qd.history.push('wrong');
            }
            if (qd.outcome === 'removed') {
                qd.removed = true;
            } else if (qd.outcome !== undefined) {
                qd.history.push(qd.outocme);
            }
            if (_this.data.spacedRepEnabled) {
                if (qd.outcome === 'right') {
                    qd.repInterval = nextInterval(qd.repInterval);
                } else if (qd.outcome === 'wrong') {
                    qd.repInterval = 0;
                }
            }
        });
    };

    /**
     * Called from Library tab when closed deck is selected.
     * @param  {[type]} deckName [description]
     * @return {undefined}
     */
    this.setupClosedDeck = function (deckName) {
        Log.debug('Deck setup', JSON.stringify(deckName));
        setupQuestions(deckName.file).then(function () {
            var numbers = _.map(_this.questions, qNumber);
            var min = _.min(numbers);
            var max = _.max(numbers);
            var allTags = _.uniq(_.flatten(_.pluck(_this.questions, 'tags'))).sort();
            _this.data = {
                name: deckName,
                range: {
                    min: min,
                    max: max,
                    options: {
                        floor: min,
                        ceil: max,
                        // hack to avoid bad behavior when range is 1
                        step: max - min === 1 ? 0.5 : 1,
                        precision: max - min === 1 ? 1 : 0
                    }
                },
                haveRange: min !== max,
                isUIgroupShown: {
                    header: false,
                    transliteration: false,
                    filter: false
                },
                showTags: false,
                tags: _this.filterNormalTags(allTags),
                filterTags: _.clone(filterTagsPrototype),
                reverseQandA: false,
                devanagari: false,
                qData: _.map(_this.questions, function (q) {
                    return { // question data carried across sessions
                        index: q.index,
                        history: [],
                        removed: false,
                        repInterval: 0 // spaced repetition number
                        // other fields added by beginSession
                    };
                }),
                sessionDone: false,
                // indexes qData, initially assigned by Card.setup()
                cardIndex: undefined,
                // default spaced repetition intervals same as FlashcardDB
                // ref. leitnerportal.com/LearnMore.aspx
                intervals: [0, 1, 3, 7, 15],
                // starting greater than any interval forces scan for last active interval
                currentInterval: _.max(_this.intervalChoices) + 1,
                spacedRepEnabled: false,
                sessionNumber: 0
            };
            finishSetup();
        });
    };

    /**
     * Called from Library tab when open deck is selected.
     * @param  {[type]} displayName [description]
     * @return {undefined}
     */
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

    this.outcome = function (outcome) {
        _this.cardData().outcome = outcome;
        _this.save();
    };

    this.cardData = function () {
        return _this.data.qData[_this.data.cardIndex];
    };

    this.nextCard = function () {
        for (;;) {
            var i = _this.data.cardIndex;
            i += 1;
            if (i === _this.data.qData.length) {
                break; // XXX
            }
            var qd = _this.data.qData[i];
            if (qd.passFilter && !qd.removed && qd.outcome === undefined) { // XXX
                return i;
            }
        // if (Deck.data.passFilterCardIndex === Deck.data.passFilter.length - 1) {
        //     Deck.restart(false);
        //     _this.question = undefined;
        //     $state.go('tabs.deck');
        // } else {
        //     _this.setup(Deck.data.passFilterCardIndex + 1);
        //     if (Deck.cardData().removed) {
        //         this.nextCard();
        //     }
        //     Deck.save();
        //     $state.go('tabs.card');
        }
        return null; // XXX for ESLint
    };

    this.previousCard = function () {
        // if (Deck.data.passFilterCardIndex === 0) {
        //     _this.setup(Deck.data.passFilter.length - 1);
        //     $state.go('tabs.deck');
        // } else {
        //     _this.setup(Deck.data.passFilterCardIndex - 1);
        //     $state.go('tabs.card');
        // }
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
        var getpassFilterProps = function (property) {
            var passFilter = _.filter(_this.data.qData, _.property('passFilter'));
            return _.map(passFilter, _.property(property));
        };
        var sum = function (a) {
            var plus = function (n, m) {
                return n + m;
            };
            return _.reduce(a, plus, 0);
        };
        if (_this.data) {
            _.extendOwn(_this.count, multiset(getpassFilterProps('outcome')));
            _this.count.remaining = _.filter(_this.data.qData, function (qd) {
                return qd.outcome === undefined && qd.passFilter;
            }).length;
            _this.count.wrong = sum(getpassFilterProps('wrong'));
            _this.count.hints = sum(getpassFilterProps('hints'));
            updateFilterText();
        }
    };
})
;
