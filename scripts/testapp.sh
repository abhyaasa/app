#!/usr/bin/env bash
# Build ionic app from scratch in ../testapp with elements of this app.
set -e
cd ..
rm -rf testapp
ionic start testapp tabs
cd testapp
# cp ../app/package.json .
# cp ../app/{bower.json,gulpfile.js,g} .
npm install
ionic state reset
# cp ../app/config.xml
# rm -rf www hooks; cp -r ../app/{www,hooks} .
ionic build
ionic build
# The following doesn't work when run from this script:
# ionic run ios -lcs # Run manually in testapp/
