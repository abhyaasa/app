#!/usr/bin/env python
# Code Copyright (c) Christopher T. Haynes under the MIT License.

"""Write JSON index for a directory."""

import os
import sys
import json
import argparse

EPILOG = """
The index is a list of names of .json files in the directory, excluding the index file itself (if it is in the directory).
"""

def main(args):
    # use os.path.isfile or os.path.isdir to avoid directories
    files = [filename for filename in os.listdir(args.directory)
             if filename.endswith('.json')]
    if args.output == '-':
        writer = sys.stdout
    else:
        out = args.output or args.directory + os.sep + 'index.json'
        writer = open(out, 'w')
        dirpath = os.path.abspath(args.directory)
        outdir, outfile = os.path.split(os.path.abspath(out))
        if dirpath == outdir and outfile in files:
            files.remove(outfile)
    json.dump(files, writer, indent=2, sort_keys=True)

def get_args():
    formatter = argparse.RawDescriptionHelpFormatter
    p = argparse.ArgumentParser(
        description=__doc__,
        epilog=EPILOG,
        formatter_class=formatter)
    p.add_argument('directory', nargs='?', type=str, default='.',
                   help='directory to index, default is current directory')
    p.add_argument('--output', type=str,
                   help=('output file, or "-" for stdout, default "index.json" ' +
                         'in indexed directory'))
    args = p.parse_args()
    return args

if __name__ == "__main__":
    main(get_args())
