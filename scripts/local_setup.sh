#!/usr/bin/env bash
# Setup local iOS app development context. Called by full_setup.sh.
ionic state restore # install dependencies specified in package.json
gulp flavor --name test # make sure we're using the test flavor
# REVIEW Execute the following manually if it does not work from this script.
gulp cmd -a ei # builds ios app and invokes emulator
