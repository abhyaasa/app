'use strict';

angular.module('app')

.service('Card', function ($sce, Log, $state, Deck, Library, settings, MediaSrv, _) {
    var _this = this;

    this.isDefined = false;

    this.submittedAnswer = undefined;

    this.setup = function (activeCardIndex) {
        var makeItem = function (response) {
            return {
                text: response[1],
                style: 'no-response'
            };
        };
        Deck.data.activeCardIndex = activeCardIndex;
        Deck.save();
        _this.done = false;
        _this.question = Deck.questions[Deck.data.active[activeCardIndex]];
        _this.isMA = _.contains(_this.question.tags, '.ma');
        _this.answerClass = 'answer';
        _this.isInput = _.contains(_this.question.tags, '.cs' ||
            _.contains(_this.question.tags, '.ci'));
        if (_this.isInput) {
            _this.submittedAnswer = undefined;
        }
        _this.text = _this.question.text;
        _this.type = _this.question.type;
        _this.responses = _this.question.responses;
        _this.answer = _this.question.answer;
        var number = _this.question.number;
        var numString = number === undefined ? '' : number.toString();
        var tags = Deck.filterNormalTags(_this.question.tags);
        _this.tagList = [numString].concat(tags).join(', ');
        var mp3File = _this.question.mp3;
        if (mp3File !== undefined) {
            MediaSrv.playSound(mp3File);
        }
        if (_this.type === 'true-false') {
            // Rewrite true-false as multiple-choice
            _this.responses = [
                [false, 'True'],
                [false, 'False']
            ];
            _this.responses[_this.question.answer ? 0 : 1][0] = true;
            _this.type = 'multiple-choice';
        } else if (_this.type === 'mind' && !_this.question.answer) {
            // Sequence question
            var answerIndex = _this.question.id + 1;
            if (answerIndex === Deck.questions.length) {
                $state.go('tabs.deck'); // card is last in sequence at end of deck
            } else {
                _this.question.answer = Deck.questions[answerIndex].text;
            }
        } else if (_this.question.type === 'd-t') {
            _this.answer = _this.text[0][0];
            _this.text = _this.text[0][1];
            _this.type = 'mind';
        } else if (_this.question.type === 't-d') {
            _this.answer = _this.text[0][1];
            _this.text = _this.text[0][0];
            _this.type = 'mind';
        } else if (_this.question.type === 'matching') {
            // Rewrite matching as multiple-choice, including random order, this
            // question's answer with a random selection of other answers in this
            // random sequence.
            var q = _this.question;
            if (!q.matchingEnd) {
                Log.error('No matchingEnd attribute with type matching');
            }
            _this.responses = [];
            for (var i = q.matchingBegin; i <= q.matchingEnd; i++) {
                if (i !== q.id) {
                    _this.responses.push([false, Deck.questions[i].answer]);
                }
            }
            var numResponses = 5;
            _this.responses = _.sample(_this.responses, numResponses - 1).concat([
                [true, q.answer]
            ]);
            _this.type = 'multiple-choice';
        }
        if (_this.type === 'multiple-choice') {
            if (settings.randomResponses) {
                _this.responses = _.sample(_this.responses, _this.responses.length);
            }
            _this.responseItems = _.map(_this.responses, makeItem);
            _this.numWrong = 0;
        }
        if (Deck.data.reverseQandA) {
            _this.haveHint = false;
            var answer = _this.text;
            if (_this.type === 'mind' && _this.question.answer) {
                _this.text = _this.answer;
                _this.answer = answer;
            } else if (_this.type === 'multiple-choice') {
                var rightAnswers = _.filter(_this.responses, function (pair) {
                    return pair[0];
                });
                if (rightAnswers) {
                    var text = _.sample(rightAnswers)[1];
                    if (!_.contains(['True', 'False'], text)) {
                        _this.type = 'mind';
                        _this.text = text;
                        _this.answer = answer;
                    }
                }
            }
        }
        _this.hints = _this.question.hints;
        _this.haveHint = _this.hints !== undefined && settings.enableHints;
        _this.hintIndex = _this.haveHint ? 0 : undefined;
        _this.hint = null;
        _this.isDefined = true;
        Log.debug('Card setup _this', JSON.stringify(_this));
    };

    this.outcome = function (outcome) {
        if (outcome === 'wrong') {
            _this.answerClass = 'wrong-response';
        }
        Deck.outcome(_this.question.id, outcome);
    };

    this.nextCard = function () {
        if (Deck.data.activeCardIndex === Deck.data.active.length - 1) {
            Deck.restart(false);
            _this.question = undefined;
            $state.go('tabs.deck');
        } else {
            _this.setup(Deck.data.activeCardIndex + 1);
            if (Deck.data.outcomes[Deck.data.activeCardIndex] === 'removed') {
                this.nextCard();
            }
            Deck.save();
            $state.go('tabs.card');
        }
    };

    this.previousCard = function () {
        if (Deck.data.activeCardIndex === 0) {
            _this.setup(Deck.data.active.length - 1);
            $state.go('tabs.deck');
        } else {
            _this.setup(Deck.data.activeCardIndex - 1);
            $state.go('tabs.card');
        }
    };

    this.reset = function () {
        _this.isDefined = false;
        Deck.reset();
    };

    this.resetAllDecks = function () {
        _this.reset();
        Library.resetAllDecks();
    };
})
;
