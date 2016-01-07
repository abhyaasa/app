Notes for Developers
--------------------

## Collaboration

To open discussion of collaboration possibilities, please email <abhyaasa108@gmail.com>.

## Tasks

This app is early in development, with plenty to do. See

- `todo.md` file
- tags listed in `.todo` througout source files
- GitHub [Issues](https://github.com/vasudeva-chaynes/Abhyaasa/issues) list

## Environment

REVIEW document setup for development environment

Development tools

- `git`: version control
- `ionic`: top-level app framework
- `AngularJS`: base app framework
- `angular-ui-router`: improved state management
- `underscore`: Javascript utility library
- `cordova`: cross-platform app framework
- `gulp`: development task manager
- `node`: development Javascript interpreter
- `python`: preferred language for stand-alone development tools
- `bower`: app package manager
- `karma`: test runner
- `protractor`: integration text manager
- `chrome`: development test browser (`Chrome Canary` preferred)
- `css` and `scss`: HTML style manager, and syntactically-superior development-time variant
- `coffee`: (coming soon) cleaner development syntax for Javascript
- `markdown`: preprocessor for simplified html markup
- `npm`: development package manager
- `nvm`: node and nvm version manager

Recommended development environment

- `OSX`: e.g. Yosemite on Macbook Pro
- `GitHub Desktop`: makes routine git operations convenient
- `iTerm`: better terminal emulator
- `atom`: preferred for most text editing

### Modules

`npm` development:

```
$ /bin/ls node_modules
angular-jsdoc		gulp-jshint		karma
angular-marked		gulp-karma		karma-chrome-launcher
bower			gulp-minify-css		karma-jasmine
canonical-path		gulp-ngdocs		karma-requirejs
dgeni			gulp-rename		minimist
dgeni-packages		gulp-sass		requirejs
gulp			gulp-task-listing	scsslint
gulp-concat		gulp-util		shelljs
gulp-help		jasmine-core		xml2js
gulp-inject		jsdoc
```
`npm` global:

```
~/f/s$ npm ls --depth=0 -g
/Users/home/.nvm/versions/node/v0.12.7/lib
├── bower@1.5.3
├── coffee-script@1.9.3
├── coffeelint@1.10.1
├── cordova@5.1.1
├── htmlhint@0.9.7
├── ionic@1.6.4
├── ios-deploy@1.7.0
├── ios-sim@4.1.1
├── jasmine@2.3.2
├── karma-cli@0.1.0
├── marked@0.3.5
├── node-inspector@0.12.2
├── npm@2.13.1
├── protractor@2.1.0
├── underscore@1.8.3
└── xml2js@0.4.10
```

`bower` managed:

```
$ /bin/ls www/lib
angular			angular-sanitize	underscore
angular-animate		angular-ui-router
angular-mocks		ionic
```

These lists may be a bit out of date, but they indicate most of the modules in use.

### atom editor

Atom plugins are indicated by the following list
```
~/.atom/packages$ /bin/ls
README.md		docblockr		linter-htmlhint
atom-beautify		editor-settings		linter-jscs
atom-html-preview	emmet			linter-pylint
atom-material-syntax	file-icons		linter-scss-lint
atom-material-ui	file-types		linter-xmllint
atomic-emacs		highlight-line		local-history
autocomplete-python	jshint			merge-conflicts
autoprefixer		jsonlint		pretty-json
color-picker		linter			select-rectangle
csscomb			linter-coffeelint	todo-show
csslint			linter-coffeescript	xml-formatter
```

`config.cson` links to `~/.atom/config.cson` for version control.

The atom config files, including those of the plugins, indicates preferred coding and formatting styles.

## Config

The `www/data/config.json` file object has the following attributes, managed as indicated:

- `name`, `email`, `href`, and `version`: transferred from `config.xml` by `gulp config`
- `flavor`: set by `gulp flavor`

Early in app initialization, the config object is stored stored as `$rootScope.config`.

## Debugging and building

The `mode` constant in `util.js` may be set to `'debug'`, `'build'`, or `'normal'`.

In debug mode:

- the `$log.debug` is enabled
- the library tab is always enabled to permit the browser debug console to be enabled (cmd-opt-I in chrome)

In build mode:

- the angular compiler is told not to include debug information, such as dom state links

## Flavors and data directory structure

You test and build with the current **flavor** of your choice. Change the flavor with `gulp flavor --name NAME`. The distribution comes with support for the `test` flavor, but that may not be the current flavor of distribution branches.

For each `FLAVOR` there is a `data/flavors/FLAVOR` directory with `library`, `media`, and `resources` subdirectories. If the flavor uses cdecks, there is also a `data/cdecks/FLAVOR` directory . If a deck contains media file references, those files are in a subdirectory of the `media` directory named after the deck.

`library` directories contain `DECK_NAME.json` files, where `DECK_NAME` is the name of the deck with underscores in place of spaces, and an `index.json` file containing a list of the deck file names.

`./resources` link points to `data/flavors/<current flavor>/resources/` to keep the `ionic resources` command happy so it can transform splash and icon image files.

## Tools

Run `gulp help` for annotated list of gulp project management tasks.

`gulp index` generates `./www/index.html` from `./index.html`, so edit only the latter. This avoids superfluous version control changes, as script injection order is unpredictable.

The `g` script runs shortcuts in the gulp `cmdAliases` directory. For example, to initiate the most common debugging run, execute `g i`. This runs `gulp cmd i`, which runs `gulp is i`, which runs the default gulp test build tasks and then `ionic serve -c -t ios --browser /Applications/Google\ Chrome\ Canary.app`.

Python and bash scripts are in the `tools` directory.

### Shell scripts

- `g ALIAS` is a shortcut for invoking via `gulp cmd` the script associated with `ALIAS` in the `cmdAliases` dictionary defined early in `gulpfile.js`.
- `tools/psclean.sh` removes stray processes that may be created by ionic development. If the message "An uncaught exception occurred and has been reported to Ionic" is seen, try running this script and confirm with the `ps` output that there are no stray processes. Kill them manually if need be.
- `tools/resources.sh` is run after icon or splash screen images in resources directory are changed.
- `tools/term.sh` is used by `gulp itest`.
- `tools/upload.sh` uploads the app for testing with the **ionic view** app.

### Python scripts

Python 2.6+ (maybe earlier) is needed to run `.py` scripts. Use `-h` argument for usage information. `cdeck.py --format_help` provides documentation on deck and compact deck file formats.

### jsdoc documentation

`gulp dengi` generates jsdoc documentation in the `doc/build/` directory.

REVIEW flesh out this documentation

## `$rootScope` variables

- `config`: configuration represented by `www/data/config.json`, with the following possible additional attributes:
  - `hideLibrary`: true if just one library element
- `hideTabs`: false until tabs bar configured after library index loaded
- `debug`: true when `mode` is `'debug'`
- `help`: points to help controller of current context

## `localStorage` key map

`*settings*`: `settings` service dictionary
`*openDecks*`: array of open deck display names
OPEN_DECK_DISPLAY_NAME: decks's data dictionary

## Updating

In project directory:
```
$ npm update -g cordova ionic
$ ionic platform update ios
$ ionic platform update android
$ bower update
$ npm update
$ brew update
```

In `npm update`, unmet dependency warnings can probably be ignored. If problems, try

  sudo npm uninstall -g ionic && sudo npm install ionic

If `brew update` fails:
```
$ cd `brew --prefix`
# can skip next if remote origin already exists
$ git remote add origin https://github.com/mxcl/homebrew.git
$ git fetch origin
$ git reset --hard origin/master
$ brew update
```

Ionic version update: download new ionic image and replace `www/lib` with image version.

Node update: http://theholmesoffice.com/node-js-fundamentals-how-to-upgrade-the-node-js-version/

Atom update: Preferences (Settings, cmd-,) > Updates > Update All
