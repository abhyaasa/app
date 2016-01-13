'use strict';

angular.module('app')

.controller('CardController', function ($scope, $state, $log, $ionicGesture, _,
  Deck, Card) {

    $scope.done = false;
    $scope.Card = Card;
    $scope.Deck = Deck;
    $scope.$on('$ionicView.enter', function () {
        if (!Deck.data) { // Deck.data undefined by source auto-reload
            $state.go('tabs.library');
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
        var q = Card.question;
        var items = Card.responseItems;
        if (_.contains(q.tags, '.ma')) {
            $log.debug('multiple answer', index, JSON.stringify(q.responses));
            if (q.responses[index][0]) {
                items[index].style = 'right-response';
            } else {
                items[index].style = 'wrong-response';
                Card.numWrong += 1;
            }
        } else {
            var rightIndex = _.findIndex(q.responses, isRight);
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

.service('Card', function ($sce, $log, $state, Deck, settings, _) {
    var Card = this;

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
        Card.question = Deck.questions[Deck.data.active[activeCardIndex]];
        Card.isMA = _.contains(Card.question.tags, '.ma');
        Card.answerClass = 'answer';
        Card.isInput = (_.contains(Card.question.tags, '.cs') ||
            _.contains(Card.question.tags, '.ci'));
        if (Card.isInput) {
            Card.submittedAnswer = undefined;
        }
        Card.text = Card.question.text;
        Card.type = Card.question.type;
        Card.responses = Card.question.responses;
        Card.hintIndex = Card.question.hints ? 0 : undefined;
        Card.haveHint = Card.question.hints !== undefined;
        Card.hint = null;
        Card.answer = Card.question.answer;
        if (Card.type === 'true-false') {
            // Rewrite true-false as multiple-choice
            Card.responses = [
                [false, 'True'],
                [false, 'False']
            ];
            Card.responses[Card.question.answer ? 0 : 1][0] = true;
            Card.type = 'multiple-choice';
        } else if (Card.type === 'mind' && !Card.question.answer) {
            // Sequence question
            var answerIndex = Card.question.id + 1;
            if (answerIndex === Deck.questions.length) {
                $state.go('tabs.deck'); // card is last in sequence at end of deck
            } else {
                Card.question.answer = Deck.questions[answerIndex].text;
            }
        } else if (Card.question.type === 'transliteration') {
            Card.answer = Card.text[0];
            Card.text = Card.text[1];
            Card.type = 'mind';
        } else if (Card.question.type === 'matching') {
            // Rewrite matching as multiple-choice, including random order, this
            // question's answer with a random selection of other answers in this
            // random sequence.
            var q = Card.question;
            if (!q.matchingEnd) {
                $log.error('No matchingEnd attribute with type matching');
            }
            Card.responses = [];
            for (var i = q.matchingBegin; i <= q.matchingEnd; i++) {
                if (i !== q.id) {
                    Card.responses.push([false, Deck.questions[i].answer]);
                }
            }
            var numResponses = 5;
            Card.responses = _.sample(Card.responses, numResponses - 1).concat([
                [true, q.answer]
            ]);
            Card.type = 'multiple-choice';
        }
        if (Card.type === 'multiple-choice') {
            if (settings.randomResponses) {
                Card.responses = _.sample(Card.responses, Card.responses.length);
            }
            Card.responseItems = _.map(Card.responses, makeItem);
            Card.numWrong = 0;
        }
        if (Deck.reverseQandA) {
            Card.haveHint = false;
            var answer = Card.text;
            if (Card.type === 'mind' && Card.question.answer) {
                Card.text = Card.answer;
                Card.answer = answer;
            } else if (Card.type === 'multiple-choice') {
                var rightAnswers = _.filter(Card.responses, function (pair) {
                    return pair[0];
                });
                if (rightAnswers) {
                    var text = _.sample(rightAnswers)[1];
                    if (!_.contains(['True', 'False'], text)) {
                        Card.text = text;
                        Card.answer = answer;
                    }
                }
            }
        }
        $log.debug('Card.setup', JSON.stringify(Card));
    };

    this.outcome = function (outcome) {
        if (outcome === 'wrong') {
            Card.answerClass = 'wrong-response';
        }
        Deck.outcome(Card.question.id, outcome);
    };

    this.nextCard = function () {
        if (Deck.data.activeCardIndex === Deck.data.active.length - 1) {
            Deck.data.done = true;
            Deck.save();
            $state.go('tabs.deck');
        } else {
            Card.setup(Deck.data.activeCardIndex + 1);
            if (Deck.data.outcomes[Deck.data.activeCardIndex] === 'removed') {
                this.nextCard();
            }
            Deck.save();
            $state.go('tabs.card');
        }
    };

    this.previousCard = function () {
        if (Deck.data.activeCardIndex === 0) {
            Card.setup(Deck.data.active.length - 1);
            $state.go('tabs.deck');
        } else {
            Card.setup(Deck.data.activeCardIndex - 1);
            $state.go('tabs.card');
        }
    };
});
