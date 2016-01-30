'use strict';

angular.module('app', ['ionic', 'services'])

.run(function ($ionicPlatform, $rootScope, $state, restoreSettings, settings, mode) {

    // https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions\
    // #issue-im-getting-a-blank-screen-and-there-are-no-errors
    $rootScope.$on('$stateChangeError', console.log.bind(console));

    $ionicPlatform.ready(function () {
        // From ionic starter
        // Hide the accessory bar by default (remove this to show the
        // accessory bar above the keyboard for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    $rootScope.hideTabs = true;
    $rootScope.debug = mode === 'debug';
    $rootScope.settings = settings;

    restoreSettings();
    if (settings.intro) {
        $state.go('tabs.intro');
    }
})

.controller('TabsController', function ($rootScope, configPromise, $log) {
    // promise is resolved: https://github.com/angular-ui/ui-router/wiki
    $rootScope.config = configPromise.data;
    $log.debug('config', JSON.stringify($rootScope.config));
})

.config(function ($stateProvider, $urlRouterProvider, $logProvider, getDataProvider,
  mode, $compileProvider) {
    $logProvider.debugEnabled(mode === 'debug');
    $compileProvider.debugInfoEnabled(mode !== 'build');

    $stateProvider
    .state('tabs', {
        url: '/tabs',
        abstract: true,
        templateUrl: 'views/tabs.html',
        resolve: {
            configPromise: function () {
                return getDataProvider.$get()('config.json');
            }},
        controller: 'TabsController'
    })
    .state('tabs.intro', {
        url: '/intro',
        views: {
            'intro-tab': {
                templateUrl: 'views/intro/intro.html',
                controller: 'IntroController'
            }
        },
        onEnter: function ($rootScope, $state) {
            $rootScope.help = function () { $state.go('tabs.intro'); };
        }
    })
    .state('tabs.library', {
        url: '/library',
        resolve: {
            indexPromise: function () {
                return getDataProvider.$get()('flavor/library/index.json');
            }},
        views: {
            'library-tab': {
                templateUrl: 'views/library/library.html',
                controller: 'LibraryController'
            }
        },
        onEnter: function ($rootScope, $state, Library) {
            Library.updateDeckLists();
            $rootScope.help = function () { $state.go('tabs.library-help'); };
        }
    })
    .state('tabs.library-help', {
        url: '/libraryHelp',
        views: {
            'library-tab': {
                templateUrl: 'views/library/help.html',
                controller: 'LibraryHelpController'
            }
        },
        onEnter: function ($rootScope, $state) {
            $rootScope.help = function () { $state.go('tabs.library-help'); };
        }
    })
    .state('tabs.deck', {
        url: '/deck',
        views: {
            'deck-tab': {
                templateUrl: 'views/deck/deck.html',
                controller: 'DeckController'
            }
        },
        onEnter: function ($rootScope, $state, Deck) {
            $rootScope.help = function () { $state.go('tabs.deck-help'); };
            Deck.enterTab();
        }
    })
    .state('tabs.deck-help', {
        url: '/deckHelp',
        views: {
            'deck-tab': {
                templateUrl: 'views/deck/help.html',
                controller: 'DeckHelpController'
            }
        },
        onEnter: function ($rootScope, $state) {
            $rootScope.help = function () { $state.go('tabs.deck-help'); };
        }
    })
    .state('tabs.card', {
        url: '/card',
        views: {
            'card-tab': {
                templateUrl: 'views/card/card.html',
                controller: 'CardController'
            }
        },
        onEnter: function ($rootScope, $state) {
            $rootScope.help = function () { $state.go('tabs.card-help'); };
        }
    })
    .state('tabs.card-help', {
        url: '/cardHelp',
        views: {
            'card-tab': {
                templateUrl: 'views/card/help.html',
                controller: 'CardHelpController'
            }
        },
        onEnter: function ($rootScope, $state) {
            $rootScope.help = function () { $state.go('tabs.card-help'); };
        }
    })
    .state('tabs.settings', {
        url: '/settings',
        views: {
            'settings-tab': {
                templateUrl: 'views/settings/settings.html',
                controller: 'SettingsController'
            }
        },
        onEnter: function ($rootScope, $state) {
            $rootScope.help = function () { $state.go('tabs.settings-help'); };
        },
        onExit: function (saveSettings) {
            saveSettings();
        }
    })
    .state('tabs.about', {
        url: '/about',
        views: {
            'settings-tab': {
                templateUrl: 'views/about/about.html',
                controller: 'AboutController'
            }
        },
        onExit: function (settings, LocalStorage, _) {
            var s = {};
            _.extendOwn(s, settings);
            LocalStorage.setObject('settings', s);
        }
    })
    .state('tabs.reset', {
        url: '/reset',
        views: {
            'settings-tab': {
                templateUrl: 'views/reset/reset.html',
                controller: 'ResetController'
            }
        },
        onExit: function (saveSettings) {
            saveSettings();
        }
    })
    .state('tabs.settings-help', {
        url: '/settingsHelp',
        views: {
            'settings-tab': {
                templateUrl: 'views/settings/help.html',
                controller: 'SettingsHelpController'
            }
        },
        onEnter: function ($rootScope, $state) {
            $rootScope.help = function () { $state.go('tabs.settings-help'); };
        }
    });
    $urlRouterProvider.otherwise('/tabs/library');
})
;
