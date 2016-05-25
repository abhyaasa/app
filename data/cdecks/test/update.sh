../../../scripts/cdeck.py $1 ../../flavors/${PWD##*/}/library/$1.json -m data/flavor/media/$1 --copyright "$2"
../../../scripts/index.py ../../flavors/${PWD##*/}/library
