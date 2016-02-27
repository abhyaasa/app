#!/usr/bin/env bash
# Build ionic app from scratch in ../testapp with elements of this app.
set -e
cd ..
rm -rf testapp
ionic start testapp tabs
cd testapp
cp ../app/package.json .
npm install
ionic state reset
# cp -r ../app/data .  # not needed unless flavor, md used
# cp -f ../app/bower.json .; bower install # not needed with www copy
rm -rf www; cp -r ../app/www .
# cp ../app/config.xml
# rm -rf hooks; cp -r ../app/hooks .  # not needed w/o config mods
# ionic build
# ionic build
# The following doesn't work when run from this script:
# ionic run ios -lcs # Run manually in testapp/
