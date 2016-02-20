#!/usr/bin/env bash
# Build ionic app from scratch in ../testapp with elements of this app and
# start emulator to test it, as a partial check for dependency incompatibilities.
cd ..
rm -rf testapp
ionic start testapp tabs
cd testapp
cp ../app/{package.json} .
rm -rf www
cp -r ../app/www .
ionic state reset
ionic build
ionic build
# The following doesn't work when run from this script:
# ionic run ios -lcs # Run manually in testapp/
