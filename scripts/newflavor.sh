#!/usr/bin/env bash
# Usage: newflavor NAME
# Creates file structure for new flavor.
# Then if desired edit the copyright paramater of data/NAME/update.sh 
# and replace data/flavors/NAME/media/logo-44.png.

mkdir data/cdecks/$1 data/flavors/$1 data/flavors/$1/{library,media,resources}
cp data/cdecks/test/{README,update.sh} data/cdecks/$1
cp data/flavors/test/media/logo-44.png data/flavors/$1/media