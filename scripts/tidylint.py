#!/usr/bin/env python
'''Customized HTML linting based on a few constant declarations.'''

import sys
from subprocess import Popen, PIPE

# paths to tidy-html5 executable and config file
TIDY = '/usr/local/Cellar/tidy-html5/5.1.25/bin/tidy'
CONFIG = sys.path[0] + '/../.tidyrc'

# tidy output lines containing the contents of any of the following lines are removed
FILTER_LINES = '''
is not approved by W3C
proprietary attribute
lacks "alt" attribute
missing <!DOCTYPE> declaration
trimming empty <i>
replacing unexpected
discarding unexpected
already defined
nested emphasis <x>
missing </
inserting implicit
plain text isn't allowed in <head> elements
missing 'title'
'''.split('\n')[1:-1]


def line_filter(line):
    return not any(map(lambda f_line: f_line in line, FILTER_LINES))


atom_call = False
for i in range(1, len(sys.argv)):
    # linter-tidy arguments start with '-quiet -utf8 -errors'
    if sys.argv[i].startswith('-'):
        atom_call = True
        continue
    args = [TIDY, '-config', CONFIG, sys.argv[i]]
    p = Popen(args, stdout=PIPE, stderr=PIPE)
    stdout, stderr = p.communicate()
    err_lines = filter(line_filter, stderr.split('\n'))
    if err_lines[0]:
        sys.stderr.write('>>>>> FILE: ' + sys.argv[i] + '\n')
    sys.stderr.write('\n'.join(err_lines))
