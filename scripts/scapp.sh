#!/usr/bin/env bash
# Shallow-clone the app in directory ../scapp and perform setup.
set -e
cd ..
rm -rf scapp
git clone --depth=1 https://github.com/abhyaasa/app scapp
cd scapp
./scripts/setup.sh