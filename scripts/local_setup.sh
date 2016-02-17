#!/usr/bin/env bash
# Setup local iOS app development context. Called by full_setup.sh.
ionic state restore # install dependencies specified in package.json
bower install
gulp flavor --name test # make sure we're using the test flavor
gulp si # serve ios app in default browser
