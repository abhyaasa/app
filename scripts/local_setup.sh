#!/usr/bin/env bash
# Setup local iOS app development context. Called by full_setup.sh.
ionic state restore # install dependencies specified in package.json
gulp flavor --name test # make sure we're using the test flavor
# REVIEW The following may not work when invoked from this script.
gulp cmd -a ei # manually execute this to build app ios app and invokes emulator
