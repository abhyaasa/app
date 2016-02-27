Things To Do
============

There are lots of things to do. Some are recorded as Atom todo-show (ctrl-shift-T) tagged entries (mostly in comments). The `todo-show` tag list in `~/.atom/config.cson` is mirrored by the top-level items below, in roughly decreasing order of priority.
Order within groups sometimes reflects decreasing priority. Items are only listed here if they do not have a more meaningful location in other files. Excluded from the `todo-show` scan (by the `ignoreThesePaths` configuration list) are this file, library, auto-generated files, and archive files, and for the time being `**spec.js` files.

- XXX 3
  - script for non-dev setup
  - upload not working
  - play www/data/media/Omkara.mp3

- FIXME 1
  - emulator fails to load media file: Feb 18 16:09:31 dram Abhyaasa[45438]: Unknown resource 'data/flavor/media/deck_2/omkara.mp3'

- CHANGED

- PRIORITY

- TODO 5
  - git merge branch to master (upstream)
  - move media decks (no clash with sound)
  - g ri: runs emulator
  - gulp jshint and jscs color output and exit
  - xcode debugger breakpoints

- IDEA

- HACK

- REVIEW 6
  - gulp error handling, wait for gulp4? http://artandlogic.com/2014/05/error-handling-in-gulp/, https://www.npmjs.com/package/gulp-exit
  - sanskrit embedded in text
  - typescript http://blog.ionic.io/ionic-and-typescript-part-2/
  - Coffee, jade, NOT stylus
  - Chrome developer > angularjs > hints
  - check for unused variables: .jshintrc "unused": true

- PUBLISH 3
  - make injected functions minifiable, e.g. function (a, b){} => ['a', 'b', function (a, b){}, use ng-strict-di: AngularJS Web Application Development Cookbook p 281
  - remove Log.debug calls
  - iTunes publication

- ANDROID 3
  - emulator testing
  - emulation on Windows: genymotion or AMIDuOS? See  http://www.laptopmag.com/articles/run-android-apps-on-pc
  - device testing

- FUTURE lots
  - ionic 2, angular 2, typescript coversion
  - replace gulp with npm? http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/, https://www.tildedave.com/2015/01/07/i-find-gulp-extremely-frustrating.html
  - splash and icon http://learn.ionicframework.com/formulas/adding-an-icon/ and  http://blog.ionic.io/automating-icons-and-splash-screens/  - Leitner learning algorithm https://en.wikipedia.org/wiki/Leitner_system
  - devanagari q, transliteration a
  - deck state copy, rename, reorder, etc
  - add python and xml linting
  - document code, e.g. https://www.npmjs.com/package/gulp-ngdocs
  - flesh out jsdoc documentation and improve dgeni formatting
  - consider adding other features, as in notes/features.txt
  - ionic 1.2 issues
    - `<label -> <ion-label`
  - add sound directive
  - show scrollbar when full text not visible
  - deck filtering to subtab
  - unit and integration tests
    - remove .atom/config.cson>"todo-show">ignoreThesePaths>...spec.js
    - https://github.com/CaryLandholt/ng-classify
    - install https://www.npmjs.com/package/gulp-ng-classify#coffeescript
    - install https://github.com/js2coffee/js2coffee
    - install http://compass-style.org
    - test angular-marked with coffee
