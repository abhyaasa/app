#!/usr/bin/env bash
# Full iOS development setup, including global dependencies.
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" # install brew
brew install node # also installs npm
npm install -g cordova ionic bower # globally command installations
# npm install -g jasmine protractor # REVIEW global installs not yet needed
./scripts/local_setup.sh
