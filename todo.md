Things To Do
============

There are lots of things to do. Some are recorded as Atom todo-show (ctrl-shift-T) tagged entries (mostly in comments). The `todo-show` tag list in `~/.atom/config.cson` is mirrored by the top-level items below, in roughly decreasing order of priority. Tags below with trailing `/` are place holders. 

Order within groups sometimes reflects decreasing priority. Items are only listed here if they do not have a more meaningful location in other files. 

Excluded from the `todo-show` scan (by the `ignoreThesePaths` configuration list) are library, auto-generated, and archive files, and for the time being `**spec.js` files.

- XXX /

- FIXME /

- CHANGED /

- PRIORITY /

- TODO
  - deck info http://codepen.io/ionic/pen/uJkCz, also for sanskrit and filtering
  - range slider right margin
  - try apple archive run
  - Leitner learning algorithm https://en.wikipedia.org/wiki/Leitner_system

- IDEA /

- HACK /

- REVIEW
  - which iOS versions supported? Document for android also
  - on-swipe-left="next()" does not work in ion-content
  - gulp error handling, wait for gulp4? http://artandlogic.com/2014/05/error-handling-in-gulp/, https://www.npmjs.com/package/gulp-exit
  - consider Coffee, jade, NOT stylus
  - Chrome developer > angularjs > hints
  - convert to Python 3
  
- ANDROID
  - device testing

- PUBLISH
  - check for unused variables: .jshintrc "unused": true
  - make injected functions minifiable, e.g. function (a, b){} => ['a', 'b', function (a, b){}, use ng-strict-di: AngularJS Web Application Development Cookbook p 281
  - remove Log.debug calls
  - check xcode compile warnings, such as first Images.xcassets
  - iTunes publication
  - android publication

- FUTURE
  - https://www.npmjs.com/package/gulp-ng-constant ?
  - gulp jshint and jscs exit
  - ionic 2, angular 2, typescript coversion http://blog.ionic.io/ionic-and-typescript-part-2/
  - replace gulp with npm? http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/, https://www.tildedave.com/2015/01/07/i-find-gulp-extremely-frustrating.html
  - splash and icon http://learn.ionicframework.com/formulas/adding-an-icon/ and  http://blog.ionic.io/automating-icons-and-splash-screens/ 
  - deck state copy, rename, reorder, etc
  - document code, e.g. https://www.npmjs.com/package/gulp-ngdocs
  - flesh out jsdoc documentation and improve dgeni formatting
  - consider adding other features, as in notes/features.txt
  - unit and integration tests
    - remove .atom/config.cson>"todo-show">ignoreThesePaths>...spec.js
    - https://github.com/CaryLandholt/ng-classify
    - install https://www.npmjs.com/package/gulp-ng-classify#coffeescript
    - install https://github.com/js2coffee/js2coffee
    - install http://compass-style.org
    - test angular-marked with coffee
