'use strict';

angular.module('app')

.service('Deck', function (Log, $state, $rootScope, settings, getData, Library, _,
    LocalStorage, $filter) {
    var _this = this;

    var filterTagsProto = {
        include: [],
        exclude: [],
        require: []
    };

    var defaultHeader = {
        '.sanskrit': false
    };

    var countKeys = 'right wrong skipped removed hints remaining'.split(' ');

    this.isDefined = false;

    this.count = _.object(countKeys, _.map(_.range(countKeys.length), _.constant(0)));

    this.filterTagsKeys = _.keys(filterTagsProto);

    this.tagFilterText = _.mapObject(filterTagsProto, _.constant(''));

    this.filterNormalTags = function (tags) {
        return _.filter(tags, function (tag) {
            return tag.charAt(0) !== '.';
        });
    };

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

    var spacedRepetition = function () {
        var sessionIntervals = _.filter(_this.data.repIntervals, function (i) {
            return i === 0 || _this.data.sessionNumber % i === 0;
        });
        _.each(_this.data.qData, function (qd) {
            qd.active = qd.active && _.contains(sessionIntervals, qd.repInterval);
        });
    };

    this.filterQuestions = function () {
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
            qd.active = _.contains(indices, qd.id);
        });
        updateFilterText();
        if (_this.data.spacedRepEnabled) {
            spacedRepetition();
        }
        return indices.length !== 0;
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

    this.restoreRemoved = function () {
        _.each(_this.data.qData, function (qd) {
            qd.removed = false;
        });
    };

    this.beginSession = function () {
        _.each(_this.data.qData, function (qd) {
            _.extendOwn(qd, {
                active: false,
                outcome: undefined, // right, wrong, undefined (skipped), removed
                hints: 0,
                wrong: 0
            });
        });
        _this.filterQuestions();
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
            var dri = _this.data.repIntervals;
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

    var finishSetup = function () {
        if (_this.data.haveRange) {
            _this.data.range.options.onEnd = function () {
                _this.filterQuestions();
            };
        }
        _this.beginSession();
        _this.isDefined = true;
        _this.settingUp = false;
        _this.save();
        $state.go('tabs.card');
    };

    this.setupClosedDeck = function (deckName) {
        Log.debug('Deck setup', JSON.stringify(deckName));
        setupQuestions(deckName.file).then(function () {
            var numbers = _.map(_this.questions, qNumber);
            var min = _.min(numbers);
            var max = _.max(numbers);
            var allTags = _.uniq(_.flatten(_.pluck(_this.questions, 'tags'))).sort();
            _this.data = { // saved state of open deck
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
                filterTags: _.clone(filterTagsProto),
                reverseQandA: false,
                devanagari: false,
                qData: _.map(_this.questions, function (q) {
                    return { // question data carried across sessions
                        index: q.index,
                        history: [],
                        removed: false,
                        repInterval: 0 // spaced repetition number
                    }; // other fields added by beginSession
                }),
                sessionDone: false,
                // indexes qData, initially assigned by Card.setup()
                cardIndex: undefined,
                // intervals same as FlashcardDB, ref. leitnerportal.com/LearnMore.aspx
                repIntervals: [0, 1, 3, 7, 15],
                spacedRepEnabled: false,
                sessionNumber: 0
            };
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

    this.outcome = function (outcome) {
        _this.cardData().outcome = outcome;
        _this.save();
    };

    this.cardData = function () {
        return _this.data.qData[_this.data.cardIndex];
    };

    var getActiveProps = function (property) {
        var active = _.filter(_this.data.qData, _.property('active'));
        return _.map(active, _.property(property));
    };

    var sum = function (a) {
        var plus = function (n, m) {
            return n + m;
        };
        return _.reduce(a, plus, 0);
    };

    this.nextCard = function () {
        while (true) {
            var i = _this.data.cardIndex;
            i += 1;
            if (i === _this.data.qData.length) {
                break; // XXX
            }
            var qd = _this.data.qData[i];
            if (qd.active && !qd.removed && qd.outcome === undefined) {
                return i;
            }
        // if (Deck.data.activeCardIndex === Deck.data.active.length - 1) {
        //     Deck.restart(false);
        //     _this.question = undefined;
        //     $state.go('tabs.deck');
        // } else {
        //     _this.setup(Deck.data.activeCardIndex + 1);
        //     if (Deck.cardData().removed) {
        //         this.nextCard();
        //     }
        //     Deck.save();
        //     $state.go('tabs.card');
        // }
    };

    this.previousCard = function () {
        // if (Deck.data.activeCardIndex === 0) {
        //     _this.setup(Deck.data.active.length - 1);
        //     $state.go('tabs.deck');
        // } else {
        //     _this.setup(Deck.data.activeCardIndex - 1);
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
        if (_this.data) {
            _.extendOwn(_this.count, multiset(getActiveProps('outcome')));
            _this.count.remaining = _.filter(_this.data.qData, function (qd) {
                return qd.outcome === undefined && qd.active;
            }).length;
            _this.count.wrong = sum(getActiveProps('wrong'));
            _this.count.hints = sum(getActiveProps('hints'));
            updateFilterText();
        }
    };
})
;
