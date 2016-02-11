#!/usr/bin/env bash
# Shallow-clone the app in directory ../scapp, setup, and emulate it.
cd ..
rm -rf scapp
git clone --depth=1 https://github.com/abhyaasa/app scapp
cd scapp
./scripts/local_setup.sh
