Things To Do
============

There are lots of things to do. Some are recorded as Atom todo-show (ctrl-shift-T) tagged entries (mostly in comments). See the `todo-show` attribute list in `.atom_config.cson` for the tag list, in roughly decreasing order of priority.

A partial list of additional todo items follows, grouped in approximately decreasing priority order reflected by todo-show group tags. Order within groups sometimes reflects decreasing priority.

- FIXME bugs with unknown location
  - xcode console: 2016-02-11 17:43:58.971 Abhyaasa[55934:1772096] ERROR Internal navigation rejected - <allow-navigation> not set for url='http://172.27.35.142:8100/'
  - added`<allow-navigation href="*" />` to config.xml
  - xcode simulator and device run launches device app, only shows ionic spinner, last console messages```
  2016-02-11 20:23:56.181 Abhyaasa[59538:2107071] Resetting plugins due to page load.
  2016-02-11 20:24:16.560 Abhyaasa[59538:2107071] Failed to load webpage with error: The request timed out.```
  - xcode console
  - ionic emulate and run --device work
  - ionic view displays nav and tab bars, but no tab icons or tab content

  - stub file reads:
    app.js: getDataProvider.$get()('config.json')
    app.js: getDataProvider.$get()('flavor/library/index.json')
    deck.js: getData('flavor/library/' + fileName)

- REVIEW items for periodic consideration
  - xcode warning also in tabtest (along with 4 status bar warnings): CDVSplashScreen.m: 'interfaceOrientation' is deprecated: first deprecated in iOS 8.0, updateBounds method line
    UIInterfaceOrientation orientation = self.viewController.interfaceOrientation;
  - build warnings, also in tabtest:```
    /* com.apple.actool.document.warnings */
    /Users/home/DD/app/platforms/ios/Abhyaasa/Images.xcassets:./AppIcon.appiconset: warning: A 83.5x83.5@2x app icon is required for iPad apps targeting iOS 9.0 and later
    /Users/home/DD/app/platforms/ios/Abhyaasa/Images.xcassets:./AppIcon.appiconset/(null)[2d][icon-60.png]: warning: The app icon set "AppIcon" has an unassigned child.```
  - xcode tabtest runs in simulator, and on device app shows start screen, but is unresponsive. Output window ends with:```
    2016-02-05 16:02:46.606 tabtest[586:171577] THREAD WARNING: ['Device'] took '11.128906' ms. Plugin should use a background thread.```
  - sanskrit embedded in text
  - typescript http://blog.ionic.io/ionic-and-typescript-part-2/
  - Coffee, jade, NOT stylus
  - Chrome developer > angularjs > hints


- PUBLISH tasks
  - make injected functions minifiable, e.g. function (a, b){} => ['a', 'b', function (a, b){}, use ng-strict-di: AngularJS Web Application Development Cookbook p 281
  - remove $log.debug calls
  - iTunes publication


- FUTURE for consideration at a later time  
  - ionic 2, angular 2, typescript coversion
  - splash and icon http://learn.ionicframework.com/formulas/adding-an-icon/ and  http://blog.ionic.io/automating-icons-and-splash-screens/  - Leitner learning algorithm https://en.wikipedia.org/wiki/Leitner_system
  - devanagari q, transliteration a
  - deck state copy, rename, reorder, etc
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


- ANDROID future implementation
  - emulator testing
  - emulation on Windows: genymotion or AMIDuOS? See  http://www.laptopmag.com/articles/run-android-apps-on-pc
  - device testing
