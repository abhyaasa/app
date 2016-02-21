#!/usr/bin/env bash
# Setup local iOS app development context. Called by full_setup.sh.
npm install # create node_modules per package.json
bower install # create www/lib per package.json
ionic state restore # create platforms and plugins per package.json
gulp flavor --name test # make sure we're using the test flavor
gulp si # serve ios app in default browser
