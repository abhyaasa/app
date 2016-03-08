Notes for Developers
--------------------

## Collaboration

To open discussion of collaboration possibilities, please email <abhyaasa108@gmail.com>.

This project uses [semantic versioning](http://semver.org).


## Repository setup and test

The following assumes an OSX (MaxOS) development platform, which is required for iOS development.

Install [Atom](https://atom.io), or other development editor, as needed.

Install [Node 4](https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkg) (includes `npm`).

Install [xcode](https://developer.apple.com/xcode/download/): needed for emulator and USB-connected device testing. See http://www.macinstruct.com/node/494.

Clone the app repository, creating an `app` directory in the current directory:
```
$ git clone https://github.com/abhyaasa/app
$ cd app
```
Unless noted otherwise, throughout the development process all subsequent CLI commands are to be executed in the project directory.

Next, install global dependencies:
```
$ npm install -g cordova ionic ios-sim gulp bower
```

The following command line completes a minimal app development installation. The voluminous output generated may overflow the terminal buffer, so output is saved in `temp/setup.txt` for inspection if something goes wrong.  
```
$ ./scripts/setup.sh | tee temp/setup.txt
```

Install [Chrome Canary](https://www.google.com/chrome/browser/canary.html) for server app testing in the preferred development browser. Try it out with the CLI shortcut command `g si`.

Test the app in the iOS emulator with `g ei`.

An Apple developer membership is required for testing on a usb-connected device, as with `g ri`.

You now have exercised a minimal development setup.


## Tools

This section lists the development tools required or recommended for this project. First, those that come with OSX or with installation instructions above:

- `git`: version control
- `ionic`: top-level app framework and CLI command
- `AngularJS`: base app framework
- `angular-ui-router`: improved state management
- `underscore`: Javascript utility library
- `cordova`: cross-platform app framework
- `gulp`: development task manager
- `node`: development Javascript interpreter
- `python`: preferred language for stand-alone development scripts
- `bower`: app package manager
- `chrome`: development test browser (`Chrome Canary` preferred)
- `css` and `scss`: HTML style manager, and syntactically-superior development-time variant
- `markdown`: preprocessor for simplified html markup *
- `npm`: development package manager
- `xcode`: iOS app deployment and setup for device testing (only on OSX)

The following are used for automatic testing and installed with `npm`:

- `karma`: test runner
- `protractor`: integration task manager

The node version manager, `nvm`, allows `npm` to be used without `sudo`. Install it using `npm`: https://www.npmjs.com/package/nvm.  Or the Ruby package manager `brew`, may be used:
```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ brew nvm
```

`tidy`, the recommended html linter, is also updated with `brew install tidy-html5`.

Recommended OSX development tools with standard app installers:

- `genymotion`: Android app emulation
- `atom`: preferred for most text editing
- `GitHub Desktop`: makes routine git operations convenient (`SourceTree` might be preferable)
- `iTerm`: better OSX upterminal emulator
- `inkscape`: svg to png conversion and other vector graphic editing
- `P4Merge`: setup as git external diff and merge tool


## Tasks

This app is early in development, with plenty to do. See

- `todo.md` file
- tags listed in `.todo` througout source files
- GitHub [Issues](https://github.com/abhyaasa/app/issues) list


### Atom editor

`.atom_config.cson` has recommended `~/.atom/config.cson` contents.

Atom plugins are indicated by the following list
```
$ /bin/ls ~/.atom/packages
README.md		docblockr		
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

### Ionic view

[Ionic view](http://view.ionic.io) supports allows convenient iOS and Android testing and sharing of development versions an iOS or Android app. Each developer used their own account.

### gulp

Use the gulp CLI command only in the project directory.

Run `gulp help` for an annotated list of gulp project management tasks.

`gulp index` generates `./www/index.html` from `./index.html`, so edit only the latter. This avoids superfluous version control changes, as script injection order is unpredictable.

The `g` script runs shortcuts in the gulp `cmdAliases` configuration variable. For example, to initiate the most common debugging run, execute `g si`. This runs `gulp cmd si | tee temp/cmd.txt`, which runs `gulp si -i`, which runs the default gulp test build tasks and then `ionic serve -c -t ios --browser /Applications/Google\ Chrome\ Canary.app`, with output appearing on the console and saved in `temp/cmd.txt`. Run `gulp cmd` for alias list.

Use `g help` for a list of the `gulp cmd` aliases.


## Config

The `www/data/config.json` file object has the keys `name`, `email`, `href`, `version`, and `flavor`. The last should only be changed by `gulp flavor`.

Early in app initialization, the config object is stored stored as `$rootScope.config`.


## Debugging and building

The `mode` constant in `services.js` may be set to `'debug'`, `'build'`, or `'normal'`.

In debug mode:

- `Log.debug` is enabled
- the library tab is always enabled to permit the browser debug console to be enabled (cmd-opt-I in chrome)

In build mode:

- the angular compiler is told not to include debug information, such as dom state links


## Flavors and data directory structure

You test and build with the current **flavor** of your choice. Change the flavor with `gulp flavor --name NAME`, which must be run after system download. The distribution comes with support for the `test` flavor, but that may not be the current flavor of distribution branches.

For each `FLAVOR` there is a `data/flavors/FLAVOR` directory with `library`, `media`, and `resources` subdirectories. If the flavor uses cdecks, there is also a `data/cdecks/FLAVOR` directory . If a deck contains media file references, those files are in a subdirectory of the `media` directory named after the deck.

`library` directories contain `DECK_NAME.json` files, where `DECK_NAME` is the name of the deck with underscores in place of spaces, and an `index.json` file containing a list of the deck file names.

`./resources` link points to `data/flavors/<current flavor>/resources/` to keep the `ionic resources` command happy so it can transform splash and icon image files.


## Scripts

Python and shell scripts. All but `g` are in the `scripts` directory.

### Shell scripts

- `g ALIAS` is a shortcut for invoking via `gulp cmd` the script associated with `ALIAS` in the `cmdAliases` dictionary defined early in `gulpfile.js`.
- `scripts/setup.sh` installs local dependencies.
- `scripts/term.sh` is used by `gulp itest`.
- `scripts/scapp.sh` creates shallow clone of the app.
- `scripts/psclean.sh` removes stray processes that may be created by ionic development. If the message "An uncaught exception occurred and has been reported to Ionic" is seen, try running this script and confirm with the `ps` output that there are no stray processes. Kill them manually if need be.

### Python scripts

- `scripts/cdeck.py --format_help` provides documentation on deck and compact deck file formats.
- `scripts/index.py` creates `index.json` files for data `library` directories.
- `scripts/trans.py` converts between Devanagari and several transliteration scripts.

Correct `.py` script initial `#!` script lines as needed if `/usr/bin/env python` does not run Python 2.6+ (maybe earlier). Python 3.x will not work.

Use `-h` argument for script usage information.

### jsdoc documentation

`gulp dengi` generates jsdoc documentation in the `doc/build/` directory.

REVIEW flesh out this documentation


## `$rootScope` variables

- `config`: configuration represented by `www/data/config.json`, with the following possible additional attribute(s):
  - `hideLibrary`: true if just one library element
- `hideTabs`: false until tabs bar configured after library index loaded
- `debug`: true when `mode` is `'debug'`
- `help`: points to help controller of current context


## `localStorage` key map

If the constant `clearStorage` is true, localStorage is cleared at startup.

`*settings*`: `settings` service dictionary
`*openDecks*`: array of open deck display names
OPEN_DECK_DISPLAY_NAME: decks's data dictionary


## Updating

### Resources

After a change has been made to an image file at top level in the `resources` directory of the current flavor, the following to update the `android` and `ios` subdirectories.
```
$ ionic resources
```

### Ruby gems

These are used by OS X for `node` and `npm` management, among many other things.
```
$ brew update
```
If this fails:
```
$ cd `brew --prefix`
# can skip next if remote origin already exists
$ git remote add origin https://github.com/mxcl/homebrew.git
$ git fetch origin
$ git reset --hard origin/master
$ brew update
```

### npm and node

```
$ sudo npm install npm -g
```
or use `nvm` if that is in use.

### Development and app libraries

Update global dependencies.
```
$ npm update -g cordova ionic ios-sim gulp bower
```

Make sure that `package.json` is consistent with the installed local dependencies.
```
$ ionic state save
```

A major ionic update should be followed by updating all local dependencies:
```
bower update  # updates www/lib
scripts/setup.sh  # updates node_modules/, plugins/, and platforms/ also sets test flavor
```
Unmet dependency warnings can probably be ignored. If problems, try
`sudo npm uninstall -g ionic && sudo npm install ionic`, and repeat above.

### Tool

Node [update instructions]( http://theholmesoffice.com/node-js-fundamentals-how-to-upgrade-the-node-js-version/).

Atom update: Preferences (Settings, cmd-,) > Updates > Update All
