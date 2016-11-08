'use strict';

angular.module('app')

.controller('CardController', function ($scope, $state, Log, $ionicGesture, _,
    Deck, Card) {

    $scope.Card = Card;
    $scope.Deck = Deck;
    $scope.$on('$ionicView.enter', function () {
        if (!Deck.isDefined) { // Deck.data undefined by source auto-reload
            Card.isDefined = false;
        } else if (!Deck.data.cardIndex) {
            Card.nextCard();
        } else if (!Card.isDefined) {
            Card.setup(Deck.data.cardIndex);
        }
    });

    var gestureSetup = function () {
        var element = angular.element(document.querySelector('#content'));
        var finish = function () {
            if (!Card.showAnswer) {
                Card.outcome('skipped');
            }
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
            Card.outcome('removed');
            Card.nextCard();
        };
        $ionicGesture.on('swipeup', remove, element);
    };
    gestureSetup();

    $scope.hint = function () {
        Deck.count.hints++;
        Card.hint = Card.hints[Card.hintIndex];
        Card.hintIndex++;
        Card.haveHint = Card.hintIndex < Card.hints.length;
    };

    $scope.setOutcome = function (outcome) {
        Card.outcome(outcome);
        Card.nextCard();
    };

    $scope.showAnswer = function () {
        if (Card.type === 'mind') {
            Card.showAnswer = true;
            Card.isInput = false;
        }
    };

    $scope.isText = function () {
        Card.outcome('text');
        Card.showAnswer = true;
    };

    var isRight = function (response) {
        return response[0];
    };
    $scope.response = function (index) {
        var items = Card.responseItems;
        if (_.contains(Card.question.tags, '.ma')) {
            Log.debug('multiple answer', index, JSON.stringify(Card.responses));
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
            Card.showAnswer = true;
        }
        Log.debug('response items', JSON.stringify(items));
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
        Card.showAnswer = true;
    };

    $scope.maShowAnswer = function () {
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
        Card.showAnswer = true;
        Log.debug('showAnswer items', JSON.stringify(items));
    };
})

.filter('unsafe', function ($sce, _, settings, Deck) {
    return function (valArray) {
        var strArray = _.map(valArray, function (value) {
            var text = value;
            if (_.isArray(value)) {
                text = value[Deck.data.devanagari ? 1 : 0];
                if (Deck.data.devanagari === 'both') {
                    text += (valArray.length === 1 && value[0].length > 20) ? '\n' : ' ';
                    text += value[0];
                }
            }
            return text;
        });
        return $sce.trustAsHtml(strArray.join(''));
    };
})
;
