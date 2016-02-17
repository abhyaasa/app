'use strict';

angular.module('app')

.controller('CardController', function ($scope, $state, $log, $ionicGesture, _,
    Deck, Card) {

    $scope.done = false;
    $scope.Card = Card;
    $scope.Deck = Deck;
    $scope.$on('$ionicView.enter', function () {
        if (!Deck.data) { // Deck.data undefined by source auto-reload
            Card.question = undefined;
        } else if (!Deck.data.activeCardIndex) {
            Card.setup(0);
        } else if (!Card.question) {
            Card.setup(Deck.data.activeCardIndex);
        }
    });

    var gestureSetup = function () {
        var element = angular.element(document.querySelector('#content'));
        var finish = function () {
            if (!$scope.done) {
                Card.outcome('skipped');
            }
            $scope.done = false;
        };

        var next = function () {
            finish();
            Card.nextCard();
        };
        $ionicGesture.on('swipeleft', next, element);

        var previous = function () {
            finish();
            Card.previousCard();
        };
        $ionicGesture.on('swiperight', previous, element);

        var remove = function () {
            $scope.done = false;
            Card.outcome('removed');
            Card.nextCard();
        };
        $ionicGesture.on('swipeup', remove, element);
    };
    gestureSetup();

    // FUTURE swipedown to review card stack

    $scope.hint = function () {
        // TODO add mc and auto mind hints using settings.hintPercent
        Card.hint = Card.question.hints[Card.hintIndex];
        Card.hintIndex++;
        Card.haveHint = Card.hintIndex < Card.question.hints.length;
    };

    $scope.setOutcome = function (outcome) {
        Card.outcome(outcome);
        $scope.done = false;
        Card.nextCard();
    };

    $scope.showAnswer = function () {
        if (Card.type === 'mind') {
            $scope.done = true;
            Card.isInput = false;
        }
    };

    $scope.isText = function () {
        Card.outcome('text');
        $scope.done = true;
    };

    var isRight = function (response) {
        return response[0];
    };
    $scope.response = function (index) {
        var items = Card.responseItems;
        if (_.contains(Card.question.tags, '.ma')) {
            $log.debug('multiple answer', index, JSON.stringify(Card.responses));
            if (Card.responses[index][0]) {
                items[index].style = 'right-response';
            } else {
                items[index].style = 'wrong-response';
                Card.numWrong += 1;
            }
        } else {
            var rightIndex = _.findIndex(Card.responses, isRight);
            items[rightIndex].style = 'right-response';
            if (index !== rightIndex) {
                items[index].style = 'wrong-response';
                Card.outcome('wrong');
            } else {
                Card.outcome('right');
            }
            $scope.done = true;
        }
        $log.debug('response items', JSON.stringify(items));
    };

    $scope.submitAnswer = function (submittedAnswer) {
        var answer = Card.question.answer;
        if (_.contains(Card.question.tags, '.ci')) {
            answer = answer.toUpperCase();
            submittedAnswer = submittedAnswer.toUpperCase();
        }
        if (answer === submittedAnswer) {
            Card.outcome('right');
        } else {
            Card.outcome('wrong');
        }
        $scope.done = true;
    };

    $scope.maDone = function () {
        var items = Card.responseItems;
        for (var i = 0; i < items.length; i++) {
            if (items[i].style === 'no-response' && Card.responses[i][0]) {
                items[i].style = 'missed-response';
                Card.numWrong += 1;
            }
        }
        if (Card.numWrong > items.length / 5) {
            Card.outcome('close');
        } else if (Card.numWrong > 0) {
            Card.outcome('wrong');
        } else {
            Card.outcome('right');
        }
        $scope.done = true;
        $log.debug('Done items', JSON.stringify(items));
    };
})

.controller('CardHelpController', function () {})

.filter('unsafe', function ($sce, _, settings) {
    return function (value) {
        var text = value;
        if (_.isArray(value)) {
            text = value[settings.devanagari ? 1 : 0];
            if (settings.devanagari === 'both') {
                text += value[0].length > 20 ? '\n' : ' ';
                text += value[0];
            }
        }
        return $sce.trustAsHtml(text);
    };
})

.service('Card', function ($sce, $log, $state, Deck, settings, MediaSrv, _) {
    var _this = this;
    // FIXME pranava deck2 no answer, reverse not working either
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
        _this.question = Deck.questions[Deck.data.active[activeCardIndex]];
        _this.isMA = _.contains(_this.question.tags, '.ma');
        _this.answerClass = 'answer';
        _this.isInput = (_.contains(_this.question.tags, '.cs') ||
            _.contains(_this.question.tags, '.ci'));
        if (_this.isInput) {
            _this.submittedAnswer = undefined;
        }
        _this.text = _this.question.text;
        _this.type = _this.question.type;
        _this.responses = _this.question.responses;
        _this.hintIndex = _this.question.hints ? 0 : undefined;
        _this.haveHint = _this.question.hints !== undefined;
        _this.hint = null;
        _this.answer = _this.question.answer;
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
        } else if (_this.question.type === 'transliteration') {
            _this.answer = _this.text[0];
            _this.text = _this.text[1];
            _this.type = 'mind';
        } else if (_this.question.type === 'matching') {
            // Rewrite matching as multiple-choice, including random order, this
            // question's answer with a random selection of other answers in this
            // random sequence.
            var q = _this.question;
            if (!q.matchingEnd) {
                $log.error('No matchingEnd attribute with type matching');
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
        $log.debug('_this.setup', JSON.stringify(_this));
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
        _this.question = undefined;
        Deck.reset();
    };
});
