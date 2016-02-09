#!/usr/bin/env bash
# Build ionic app from scratch in ../testapp with elements of this app and
# start emulator to test it.
cd ..
rm -rf testapp
ionic start testapp tabs
cd testapp
cp ../app/{package.json,bower.json} .
cp -R ../app/www/data www
npm install
bower install
ionic state restore
ionic emulate ios -l -c -s
