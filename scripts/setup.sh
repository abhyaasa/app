#!/usr/bin/env bash
# Setup local iOS app development context after global installs.
# Called by full_setup.sh.
set -e
ionic state restore  # creates platforms/ and plugins/ per package.json
bower install
npm install  # create node_modules/ per package.json
gulp flavor --name test  # create resources/ and www/data/flavor/ links
ionic resources
ionic build