#!/usr/bin/env bash
# Setup iOS app development context and run emulator test.
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" # install brew
brew install node # also installs npm
npm install -g cordova ionic bower # globally command installations
# npm install -g jasmine protractor # REVIEW global installs not yet needed
npm rm --global gulp # in case an old version of gulp is installed
npm install --save-dev gulp # install gulp task manager
npm install # install in node_modules/ development dependencies specified in package.json
bower install # install in www/lib runtime dependencies specified in bower.json
ionic state restore # creates plugins/ and platforms/ as specified in package.json
gulp flavor --name test # make sure we're using the test flavor
gulp cmd -a ei # builds ios app and invokes emulator
