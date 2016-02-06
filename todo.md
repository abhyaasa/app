Things To Do
============

There are lots of things to do. Some are recorded as Atom todo-show (ctrl-shift-T) comments. The following tags are in use, in approximately decreasing order of priority: XX-X (used without the dash to indicate temporary fixtures to be removed), FIXME, CHANGED, PRIORITY, TODO, IDEAs, HACK, NOTE, REVIEW, PUBLISH, ANDROID, FUTURE.

A partial list of additional todo items follows, in approximately chronological and/or  decreasing priority order, with ? flagging questionable items.

- FIXME xcode simulator and device run launches device app, only shows good nav and tab bar without icons, no bad log messages
- FIXME ionic opens emulator and hangs with ionic twerler
- FIXME ionic view
- REVIEW xcode warning also in tabtest (along with 4 status bar warnings): CDVSplashScreen.m: 'interfaceOrientation' is deprecated: first deprecated in iOS 8.0, updateBounds method line
    UIInterfaceOrientation orientation = self.viewController.interfaceOrientation;
- REVIEW build warnings, also in tabtest:```
/* com.apple.actool.document.warnings */
/Users/home/DD/app/platforms/ios/Abhyaasa/Images.xcassets:./AppIcon.appiconset: warning: A 83.5x83.5@2x app icon is required for iPad apps targeting iOS 9.0 and later
/Users/home/DD/app/platforms/ios/Abhyaasa/Images.xcassets:./AppIcon.appiconset/(null)[2d][icon-60.png]: warning: The app icon set "AppIcon" has an unassigned child.```
- REVIEW xcode tabtest runs in simulator, and on device app shows start screen, but is unresponsive. Output window ends with:```
2016-02-05 16:02:46.606 tabtest[586:171577] THREAD WARNING: ['Device'] took '11.128906' ms. Plugin should use a background thread.```
- REVIEW sanskrit embedded in text
- devanagari q, transliteration a
- deck state copy, rename, reorder, etc
- ionic 1.2 <label -> <ion-label
- add sound directive
- show scrollbar when full text not visible
- deck filtering to subtab
- fix library search
- version in data/config.json, bower.json, package.json, and config.xml
- splash and icon http://learn.ionicframework.com/formulas/adding-an-icon/ and  http://blog.ionic.io/automating-icons-and-splash-screens/
- README.md OSX emulator installation instructions: http://www.macinstruct.com/node/494
- android emulator testing
- android emulation on Windows: genymotion or AMIDuOS? See  http://www.laptopmag.com/articles/run-android-apps-on-pc
- android device testing
- unit and integration tests
  - remove .atom/config.cson>"todo-show">ignoreThesePaths>...spec.js
- ? typescript http://blog.ionic.io/ionic-and-typescript-part-2/
- ? Coffee, jade, NOT stylus
  - https://github.com/CaryLandholt/ng-classify
  - install https://www.npmjs.com/package/gulp-ng-classify#coffeescript
  - install https://github.com/js2coffee/js2coffee
  - install http://compass-style.org
  - test angular-marked with coffee
- document code, e.g. https://www.npmjs.com/package/gulp-ngdocs
- flesh out jsdoc documentation and improve dgeni formatting
- consider adding other features, as in notes/features.txt
- Chrome developer > angularjs > hints
- PUBLISH remove $log.debug calls
- make injected functions minifiable, e.g. function (a, b){} => ['a', 'b', function (a, b){}, use ng-strict-di: AngularJS Web Application Development Cookbook p 281
- publish app
