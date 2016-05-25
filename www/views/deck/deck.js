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
            if (!('id' in _this.questions[0])) {
                _.extendOwn(_this.header, _this.questions[0]);
                _this.questions.splice(0, 1);
            }
            _this.headerDisplayKeys = _.filter(_.keys(_this.header).sort(),
                function (key) {
                    return key[0] !== '.';
                });
        });
    };

    var qNumber = function (q) {
        return q.number === undefined ? 0 : q.number;
    };

    var filterQuestions = function () {
        var sessionIntervals = _.filter(_this.data.repIntervals, function (i) {
            return i === 0 || _this.data.repSession % i === 0;
        });
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
        _.each(_this.data.qData, function (qd) {
            qd.active = (_.contains(indices, qd.id) &&
                (!_this.data.spacedRepEnabled ||
                    _.contains(sessionIntervals, qd.group)
                ));
        });
        Log.debug('indices', indices);
        return indices.length !== 0;
    };

    this.startSession = function () {
        _.each(_this.data.qData, function (qd) {
            _.extendOwn(qd, {
                active: false,
                outcome: undefined, // right, wrong, undefined (skipped), removed
                hintCount: 0,
                wrongCount: 0
            });
        });
        filterQuestions();
    };

    var updateFilterText = function () {
        _.mapObject(_this.data.filterTags, function (tags, key) {
            _this.tagFilterText[key] = (tags.length === 0 ?
                'Edit to ' + key + ' only cards with selected tags' :
                $filter('capitalize')(key) + ' tags: ' + tags.join(', '));
        });
    };

    var finishSetup = function () {
        updateFilterText();
        if (_this.data.haveRange) {
            _this.data.range.options.onEnd = function () {
                filterQuestions();
            };
        }
        _this.startSession();
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
                qData: _.map(_this.questions, function (question) {
                    return { // question data carried across sessions
                        id: question.id,
                        history: [],
                        removed: false,
                        group: 0 // spaced repetition number
                    }; // other fields added by startSession
                }),
                sessionDone: false,
                qDataIndex: undefined, // initially assigned by Card.setup()
                // intervals same as FlashcardDB, ref. leitnerportal.com/LearnMore.aspx
                repIntervals: [0, 1, 3, 7, 15],
                spacedRepEnabled: false,
                repSession: 0
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

    this.outcome = function (qid, outcome) {
        _this.cardObj().outcome = outcome;
        _this.data.history[qid].push(outcome);
        _this.save();
    };

    this.cardObj = function () {
        return _this.data.active[_this.data.activeCardIndex];
    };

    // Randomize within each sequence of indices separated by text-type question indices.
    var randomizeGroup = function () {
        var group = [];
        var seq = [];
        for (var qObj in _this.data.group) {
            if (_this.questions[qObj.index].type === 'text') {
                group = group.concat(_.sample(seq, seq.length));
                seq = [];
                group.push(qObj);
            } else {
                seq.push(qObj);
            }
        }
        _this.data.group = group.concat(_.sample(seq, seq.length));
    };

    this.restart = function (restoreRemoved) {
        _.each(_this.data.active, function (qObject) {
            qObject.outcome = undefined;
            if (restoreRemoved && qObject.group === 'removed') {
                qObject.group = 0;
            }
        });
        _this.data.repIntervalsIndex = 0;
        // XXX forward/reverse and skipped cards with spaced rep.
        // XXX _this.data.group =
        if (settings.randomQuestions) {
            randomizeGroup();
        }
        _this.data.activeCardIndex = 0;
        _this.save();
        _this.enterTab();
        if (!restoreRemoved) {
            $state.go('tabs.card');
        }
    };

    var getActiveProps = function (property) {
        var active = _.filter(_this.data.qData, _.property('active'));
        return _.map(active, _.property(property));
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
            _this.count.remaining = _.filter(_this.data.active, function (qObj) {
                return qObj.outcome === undefined && qObj.group !== 'removed';
            }).length;
            updateFilterText();
        }
    };
})
;
