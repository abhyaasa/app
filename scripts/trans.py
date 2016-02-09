#!/usr/bin/env python
# -*- coding: utf-8
# Code Copyright (c) Christopher T. Haynes under the MIT License.

"""Sanskrit transliteration conversion."""

import sys
import json
from StringIO import StringIO
import argparse
import codecs

# try:
#     # import debug
#     from pdb import set_trace as breakpoint
# except:
#     pass


UTF8Writer = codecs.getwriter('utf8')

epilog = """
Transliteration names (not case sensitive in program arguments):
    Devanagari, IAST, Harvard-Kyoto, ITRANS, Velthuis, SLP1

UTF8 encoding is used for input and output.

Shell command examples:
    Translate IAST text in file bg.iast to Devanagari with output to file bg.dev:
        $ trans.py iast devanagari -i bg.iast -o bg.dev
    Unicode Om symbol to standard output:
        $ echo om | trans.py harvard-kyoto
"""

# Unicode control character dictionary
uccd = {'zwj': u'\200D',
        'zwnj': u'\200C',
        }
uccs = uccd.values()

# Devanagari Unicode character name Dictionary
dud = {'a': u'\u0905',
       'zero': u'\u0966',
       'danda': u'\u0964',
       'double_danda': u'\u0965',
       'om': u'\u0950',
       'inverted_chandrabindu': u'\u0900',
       'chandrabindu': u'\u0901',
       'anusvara': u'\u0902',
       'visarga': u'\u0903',
       'virama': u'\u094D',  # halant
       'avagraha': u'\u093D',
       }

# map Unicode Devanagari dependent vowel signs to associated vowels
vs_to_v = {u'\u093E': u'\u0906',  # A
           u'\u093F': u'\u0907',  # i
           u'\u0940': u'\u0908',  # I
           u'\u0941': u'\u0909',  # u
           u'\u0942': u'\u090A',  # U
           u'\u0943': u'\u090B',  # R
           u'\u0944': u'\u0960',  # RR
           u'\u0947': u'\u090F',  # e
           u'\u0948': u'\u0910',  # ai
           u'\u094B': u'\u0913',  # o
           u'\u094C': u'\u0914',  # au
           }

# map Unicode Devanagari vowels to assocated dependent vowel signs
v_to_vs = {}
for k, v in vs_to_v.items():
    v_to_vs[v] = k

# lists of (devanagari, ascii) character associations
digits = [(unichr(ord(dud['zero']) + i), str(i)) for i in range(10)]
signs_and_punctuation = [(dud['danda'], '|'),
                         (dud['double_danda'], '||'),
                         (dud['avagraha'], "'"),
                         (dud['om'], 'Om '),
                         (dud['visarga'], 'h '),
                         (dud['chandrabindu'], '~'),
                         ]

passthrough_chars = u' -\n\r' + dud['danda'] + dud['double_danda']

"""Transliteration table is a list of row lists (json file format).  The first
row is lower-case transliteration names (column headers).

The second row is boolean values indicating if the transliteration is case
sensitive.

The remaining rows contain corresponding transliteration strings for
a sanskrit character. If a transliteration is case-insensitive, its column
entries are lower case.
"""
table_json = """
    [
        ["devanagari", "iast", "harvard-kyoto", "itrans", "velthuis", "slp1"],
        [true, false, true, true, false, true],
        ["\u0905", "a", "a", "a", "a", "a"],
        ["\u0906", "\u0101", "A", "A/aa", "aa", "A"],
        ["\u0907", "i", "i", "i", "i", "i"],
        ["\u0908", "\u012b", "I", "I/ii", "ii", "I"],
        ["\u0909", "u", "u", "u", "u", "u"],
        ["\u090a", "\u016b", "U", "U/uu", "uu", "U"],
        ["\u090f", "e", "e", "e", "e", "e"],
        ["\u0910", "ai", "ai", "ai", "ai", "E"],
        ["\u0913", "o", "o", "o", "o", "o"],
        ["\u0914", "au", "au", "au", "au", "O"],
        ["\u090b", "\u1e5b", "R", "RRi/R^i", ".r", "f"],
        ["\u0960", "\u1e5d", "RR", "RRI/R^I", ".rr", "F"],
        ["\u090c", "\u1e37", "lR", "LLi/L^i", ".l", "x"],
        ["\u0961", "\u1e39", "lRR", "LLI/L^I", ".ll", "X"],
        ["\u0902", "\u1e43", "M", "M/.n/.m", ".m", "M"],
        ["\u0903", "\u1e25", "H", "H", ".h", "H"],
        ["\u0901", "~", "~", ".N", "~", "~"],
        ["\u0915", "k", "k", "k", "k", "k"],
        ["\u0916", "kh", "kh", "kh", "kh", "K"],
        ["\u0917", "g", "g", "g", "g", "g"],
        ["\u0918", "gh", "gh", "gh", "gh", "G"],
        ["\u0919", "\u1e45", "G", "~N", "\\"n", "N"],
        ["\u091a", "c", "c", "ch", "c", "c"],
        ["\u091b", "ch", "ch", "Ch", "ch", "C"],
        ["\u091c", "j", "j", "j", "j", "j"],
        ["\u091d", "jh", "jh", "jh", "jh", "J"],
        ["\u091e", "\u00f1", "J", "~n", "~n", "Y"],
        ["\u091f", "\u1e6d", "T", "T", ".t", "w"],
        ["\u0920", "\u1e6dh", "Th", "Th", ".th", "W"],
        ["\u0921", "\u1e0d", "D", "D", ".d", "q"],
        ["\u0922", "\u1e0dh", "Dh", "Dh", ".dh", "Q"],
        ["\u0923", "\u1e47", "N", "N", ".n", "R"],
        ["\u0924", "t", "t", "t", "t", "t"],
        ["\u0925", "th", "th", "th", "th", "T"],
        ["\u0926", "d", "d", "d", "d", "d"],
        ["\u0927", "dh", "dh", "dh", "dh", "D"],
        ["\u0928", "n", "n", "n", "n", "n"],
        ["\u092a", "p", "p", "p", "p", "p"],
        ["\u092b", "ph", "ph", "ph", "ph", "P"],
        ["\u092c", "b", "b", "b", "b", "b"],
        ["\u092d", "bh", "bh", "bh", "bh", "B"],
        ["\u092e", "m", "m", "m", "m", "m"],
        ["\u092f", "y", "y", "y", "y", "y"],
        ["\u0930", "r", "r", "r", "r", "r"],
        ["\u0932", "l", "l", "l", "l", "l"],
        ["\u0935", "v", "v", "va/w", "v", "v"],
        ["\u0936", "\u015b", "z", "sh", "\\"s", "S"],
        ["\u0937", "\u1e63", "S", "Sh", ".s", "z"],
        ["\u0938", "s", "s", "s", "s", "s"],
        ["\u0939", "h", "h", "h", "h", "h"]
    ]
"""
# " to fix emacs quote coloring

table = None


def make_trans_dict(trans):
    """Returns transliteration dictionary for transliteration type trans.
    The dictionary maps single_letter of trans alphabet to a
    list of (letter_string, transliteration_table_row) pairs,
    where each letter string is a suffix of the single letter that
    together make an associated letter string in trans.
    An empty suffix, if any, is always last.
    """
    # First build table mapping trans character string to its table row.
    col = table[0].index(trans)
    dict = {}
    for row in range(2, len(table)):
        #  if multiple /-separated choices (ITRANS), make entry for each
        for chr in table[row][col].split('/'):
            dict[chr] = table[row]

    result = {}
    for k in sorted(dict.keys()):
        if len(k) == 1:
            result[k] = [('', dict[k])]
        else:
            if not (k[0] in result):
                # no single letter encoding for the first char of k
                result[k[0]] = []
            result[k[0]][0:0] = [(k[1:], dict[k])]
    return result


def translate(text, from_, to):
    """Translates unicode text between indicated transliteration schemes."""
    col = table[0].index(to)
    if not table[1][table[0].index(from_)]:
        text = text.lower()  # not case sensitive
    trans_dict = make_trans_dict(from_)
    output = StringIO()
    if from_ == 'devanagari':
        text = from_devanagari(text)
    i = 0
    while i < len(text):
        char = text[i]
        tuples = trans_dict.get(char)
        if tuples:
            for (suffix, trow) in tuples:
                if text[i + 1 : ].startswith(suffix):
                    #  if multiple /-separated choices (ITRANS), use the first
                    to_char = trow[col].split('/')[0]
                    output.write(to_char)
                    i += len(suffix)
                    break
        elif char in passthrough_chars:
            output.write(char)
        else:
            print >> sys.stderr, 'unrecognized character', repr(char), 'at position', i
        i += 1
    result = output.getvalue()
    if to == 'devanagari':
        result = to_devanagari(result)
    return result


def is_consonant(char):
    """Return True if char is a devanagari consonant (between ka and ha),
    and False otherwise.
    """
    return u'\u0915' <= char <= u'\u0939'


def is_vowel(char):
    """Return True if char is a devanagari vowel (between ka and ha),
    and False otherwise.
    """
    return u'\u0905' <= char <= u'\u0914'


def is_letter(char):
    return is_consonant(char) or is_vowel(char)


def to_devanagari(text):
    """Returns conventionally formatted devanagari unicode given a string of raw
    devanagari text letters.
    """
    lst = [None]  # start with a non-letter, later stripped
    last_is_consonant = False
    for char in text:
        if last_is_consonant:
            if is_vowel(char):
                if char == dud['a']:
                    last_is_consonant = False
                    continue
                else:
                    char = v_to_vs[char]
            else:
                lst.append(dud['virama'])
        last_is_consonant = is_consonant(char)
        lst.append(char)
    if last_is_consonant:
        lst.append(dud['virama'])
    lst.append(None)  # end with a non-letter, later stripped

    # replace word Om with its unicode symbol
    om_lst = list(unicode("ओम्", 'utf-8'))
    for i in range(len(lst) - 1 - len(om_lst), 0, -1):
        if lst[i : i + len(om_lst)] == om_lst:
            if not is_letter(lst[i - 1]) and not is_letter(lst[i + len(om_lst)]):
                lst[i : i + len(om_lst)] = [dud['om']]

    return ''.join(lst[1:-1])  # strip first and last (None) values


def from_devanagari(text):
    """Returns raw devanagari unicode given conventionally formatted devanagari
    unicode text letters.
    """
    output = StringIO()
    last_is_consonant = False
    for char in text:
        if char in uccs:
            continue
        if char in vs_to_v:
            char = vs_to_v[char]
        elif last_is_consonant and char != dud['virama']:
            output.write(dud['a'])
        if char == dud['om']:
            output.write(u'\u0913')  # o
            char = u'\u092E'
        else:
            last_is_consonant = is_consonant(char)
        if char != dud['virama']:
            output.write(char)
    if last_is_consonant:
        output.write(dud['a'])
    return output.getvalue()


def make_table():
    return (json.loads(table_json)
            + [[dev_char] + [roman_char] * 5
               for (dev_char, roman_char) in digits + signs_and_punctuation])


def textft(text, from_, to):
    utext = unicode(text, 'utf-8')
    print from_, 'to', to, ':', utext
    ttext = translate(utext, from_, to)
    print '>', ttext
    ftext = translate(ttext, to, from_)
    print '<', ftext
    if from_ in ['iast', 'velthius']:
        utext = utext.lower()
    if utext != ftext:
        print '>!=< : Round-trip failed'
        for i in range(min(len(utext), len(ftext))):
            if utext[i] != ftext[i]:
                print 'at char', i, ':', utext[i], ftext[i]
                break
        else:
            print 'with unequal length:', len(utext), 'and', len(ftext)
        print 'from', list(utext)
        print 'to', list(ttext)
        print 'back', list(ftext)


def test():
    textft("om", 'iast', 'devanagari')
    textft("श्रद", 'devanagari', 'iast')
    textft("श्रद्धावाँल्ल", 'devanagari', 'iast')
    textft("Atha yogānuśāsanam", 'iast', 'itrans')
    textft("अथ योगानुशासनम्॥१॥", 'devanagari', 'iast')
    textft("योगश्चित्तवृत्तिनिरोधः॥२॥", 'devanagari', 'iast')
    sys.exit()


def main(args):
    """Command line invocation with argparse args."""
    if args.test:
        test()
    args.from_ = args.__dict__['from'].lower()
    args.to = args.to.lower()
    if args.from_ not in table[0]:
        raise Exception('from transliteration name not in table')
    if args.to not in table[0]:
        raise Exception('to transliteration name not in table')
    text = unicode(args.infile.read(), 'utf-8')
    result = translate(text, args.from_, args.to)
    if args.outfile:
        writer = UTF8Writer(args.outfile)
    else:
        writer = sys.stdout
    print >> writer, result


sys.stdout = UTF8Writer(sys.stdout)

table = make_table()

if __name__ == "__main__":
    p = argparse.ArgumentParser(
        description=__doc__,
        epilog=epilog,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('from', nargs='?', default='iast', type=str,
                   help='input transliteration format')
    p.add_argument('to', nargs='?', default='devanagari', type=str,
                   help='output transliteration format, default Devanagari')
    p.add_argument('-i', '--infile', nargs='?', type=argparse.FileType('r'),
                   default=sys.stdin, help='default stdin')
    p.add_argument('-o', '--outfile', nargs='?', type=argparse.FileType('w'),
                   default=None, help='default stdout')
    p.add_argument('-t', '--test', action='store_true',
                   help='run trans.test() first')
    args = p.parse_args()
    main(args)
