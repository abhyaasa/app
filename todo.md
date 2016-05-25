# Things To Do

There are lots of things to do. Some are recorded as Atom todo-show (ctrl-shift-T) tagged entries (mostly in comments). The `todo-show` tag list in `~/.atom/config.cson` is mirrored by the top-level items below, in roughly decreasing order of priority. Tags below with trailing `/` are place holders. 

Order within groups sometimes reflects decreasing priority. Items are only listed here if they do not have a more meaningful location in other files. 

Excluded from the `todo-show` scan are library, auto-generated, and archive files, and for the time being `**spec.js` files. (See the `ignoreTheseTodos` and `ignoreThesePaths` properties of the `todo-show` configuration.)

- XXX /

- FIXME /

- CHANGED /

- TODO
  - session responses not acted upon until session concludes
    - spaced rep reset level 0
    - card info has group
  - at session end with spaced rep if there are wrong answers the questions move to end of session which continues
  - filter change apply / cancel, filter subpage, include spaced-rep?
  - with spaced rep, multiple wrong outcomes for same question, so keep wrong count
  - spaced repetition algorithm [Leitner](https://en.wikipedia.org/wiki/Leitner_system)
    - Enable (toggle)
      - default disabled with all active cards start in 0 group
      - on disable, cards remain in groups and index to first card in last group
    - Reset: cancel/confirm dialog returns all cards to 0 group and disables
       - hidden if all cards in group 0
    - Group list header
      - header: Interval | Remaining | Cards
    - Group list elements
      - N days (interval up/down widgets) | N days (remaining) | N (cards) | +
      - intervals are prime numbers, default groups: 0, 1, 7, 15
      - if up/down interval change reaches adjoining group, then $ionicPopup dialog with Confirm/Cancel for merging with encountered group
      - + icon adds group, absent if interval is 0 or next prime
        - initial interval is prime halfway between current and next group, or third-past for last
    - Question response when enabled: success to next group, or same if last group; failure to 0 group
    - Session number mod interval = days remaining
    - Sessions progress from longest to shortest interval with 0 days remaining.
       - if randomize questions mode, do so for each group before beginning it
    - Session ends when group 0 is reached and empty.
       - then display congratulations in card tab, with message to disable spaced repetition 
    - Card tab when at session end: display “Disable??"
  - script instead of Sanskrit in cdeck.py and script header info
  - try apple archive run
  - card load spinner center

- REVIEW
  - use [https://www.npmjs.com/package/gulp-beautify](https://www.npmjs.com/package/gulp-beautify)
  - which iOS versions supported? Document for android also
  - on-swipe-left="next()" does not work in ion-content
  - gulp error handling, wait for gulp4? [http://artandlogic.com/2014/05/error-handling-in-gulp/](http://artandlogic.com/2014/05/error-handling-in-gulp/), [https://www.npmjs.com/package/gulp-exit](https://www.npmjs.com/package/gulp-exit)
  - consider Coffee, jade, NOT stylus
  - Chrome developer > angularjs > hints
  - convert to Python 3
  - consider ESLint [http://www.sitepoint.com/comparison-javascript-linting-tools/](http://www.sitepoint.com/comparison-javascript-linting-tools/)

- PUBLISH
  - check for unused variables: .jshintrc "unused": true
  - make injected functions minifiable, e.g. function (a, b){} => ['a', 'b', function (a, b){}, use ng-strict-di: AngularJS Web Application Development Cookbook p 281
  - remove Log.debug calls
  - check xcode compile warnings, such as first Images.xcassets
  - iTunes publication
  - android publication

- FUTURE
  - night node
  - mark cards, review marked cards
  - undo
  - [SM-2](https://www.supermemo.com/english/ol/sm2.htm) spaced repetition
  - [https://www.npmjs.com/package/gulp-ng-constant](https://www.npmjs.com/package/gulp-ng-constant) ?
  - ionic 2, angular 2, typescript coversion [http://blog.ionic.io/ionic-and-typescript-part-2/](http://blog.ionic.io/ionic-and-typescript-part-2/)
  - replace gulp with npm? [http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/), [https://www.tildedave.com/2015/01/07/i-find-gulp-extremely-frustrating.html](https://www.tildedave.com/2015/01/07/i-find-gulp-extremely-frustrating.html)
  - splash and icon [http://learn.ionicframework.com/formulas/adding-an-icon/](http://learn.ionicframework.com/formulas/adding-an-icon/) and  [http://blog.ionic.io/automating-icons-and-splash-screens/](http://blog.ionic.io/automating-icons-and-splash-screens/) 
  - deck state copy, rename, reorder, etc
  - document code, e.g. [https://www.npmjs.com/package/gulp-ngdocs](https://www.npmjs.com/package/gulp-ngdocs)
  - flesh out jsdoc documentation and improve dgeni formatting
  - consider adding other features, as in notes/features.txt
  - unit and integration tests
    - remove .atom/config.cson>"todo-show">ignoreThesePaths>...spec.js
    - [https://github.com/CaryLandholt/ng-classify](https://github.com/CaryLandholt/ng-classify)
    - install [https://www.npmjs.com/package/gulp-ng-classify#coffeescript](https://www.npmjs.com/package/gulp-ng-classify#coffeescript)
    - install [https://github.com/js2coffee/js2coffee](https://github.com/js2coffee/js2coffee)
    - install [http://compass-style.org](http://compass-style.org)
    - test angular-marked with coffee
