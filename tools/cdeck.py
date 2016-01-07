#!/usr/bin/env python
# -*- coding: utf-8
# Code Copyright (c) Christopher T. Haynes under the MIT License.

"""cdeck preprocessor: compact deck text to json."""

import sys
import json
from StringIO import StringIO
import argparse
import codecs
import re

from trans import translate

try:
    import debug
    from pdb import set_trace as breakpoint
except:
    pass

debug_mode = False
# debug_mode = True

UTF8READER = codecs.getreader('utf8')
UTF8WRITER = codecs.getwriter('utf8')

EPILOG = """
Dependencies: python 2.6+ (maybe earlier). If the .md tag is used, install the
markdown module (http://pythonhosted.org/Markdown/index.html).
"""

FORMAT_HELP = """PREPROCESSOR INPUT SYNTAX

Notation: Grammar rules are of the form ELEMENT_TYPE -> GRAMMAR_EXPRESSION.
A grammar expression may contain the following notation.
{...} grouping, [...] optional, | or, +/* one/zero or more of the preceding form.
,.. non-empty comma-separated sequence of preceding form.
Spaces are not significant in grammar rules. Sequences are non-empty.
BOL/EOL beginning/end of line. EOF end of file.

INPUT -> { QUESTION | TAG_RANGE } +

QUESTION -> BOL ; [ TAG,.. ] ; TEXT
            { <ws>= ANSWER } | <ws>/ DISTRACTOR } *
            { <ws>? HINT } *
where TEXT, ANSWER, DISTRACTOR, and HINT are strings in which the <ws> prefixed
sequences above may not appear. This may be avoided by using \?, \=, or \/,
with the backslash escape characters removed after parsing.

TAG is a sequence of letter (case insensitive), digit, dash, dot, underscore, or
space characters. Spaces are trimmed at both ends.

TAG_RANGE -> BOL ; [ / ] TAG,.. EOL

A ;tag,.. line tag range is terminated by EOF its appearance in a ;/tag,.. line.
Questions in a tag range all have its tags.

A numeric tag has the form of an unsigned non-negataive number with optional decimal
point. A question may not have more than one numeric tag.

SEMANTIC NOTES

If no answer or distractors, then it is a sequence question, whose mind answer
is the next question. Otherwise, if one or more distractors, then multiple-choice question. If one answer and no distractors, then if answer is True, False, T or F
(case insensitive), then true/false question, and otherwise mind answer question.

HTML (raw or from markdown) is processed by replacing <em> tags with <span class="em">
and adding the img tag src prefix indicated by the optional media argument.

SPECIAL TAGS

Tags interpreted by this program and removed from output:

.lineseq : all but last line of question text is a sequence question.
           At least two lines required, no responses or hints allowed,
           and all questions in a sequence share the same tags.
.text : question of "text" type, for preferatory text (not a question)
.md : question, response, and hints text is in ascii markdown format
      (requires markdown module and associated python version, implies .html tag)
.tr : transliterate responses
.tq : transliterate question
.th : transliterate hints
.iast : IAST source for transliteration
.itrans : ITRANS source for transliteration (default)
.harvard-kyoto : Harvard-Kyoto source for transliteration
.slp1 : SLP1 source for transliteration
.velthuis : Velthuis source for transliteration
.matching : only meaningful as a range tag, indicating questions in the range
    belong to a matching group.  Questions in a matching group must each have
    a single answer and no distractors. User preferences may indicate options for
    displaying matching questions, which may include visual pairing or multiple choice,
    where distractors are chosen randomly from answers of other questions in the group.

Tags retained in output, for use by the app, and in the special_apptime_tags list:

.cs : case sensitive input responses
.ci : case insensitive input response
.html : text is in html format
.ma : multiple right answer (multiple choices) question

Text is in HTML format. The characters <, >, &, ', and " are automatically escaped in
text unless the .md or .html tags are active.

.cs and .ci tags are mutually exclusive. An input field is presented if either is present.

Use --test_input argument to display input demonstrating the above options.


JSON FORMAT

Quiz questions json format is list of question dictionaries with keys:
id: question order number (0-based)
type: string = text, true-false, multiiple-choice, matching, or mind
text: text of question
responses (absent in text, t/f, sequence and mind question types):
          list of [is_answer, response_text] pairs, where is_answer is boolean
answer (t/f, matching or mind type): boolean (t/f) or text (mind)
tags (optional): list of tag strings
hints (optional): list of hint strings
number (optional): difficulty number
matchingBegin (only if .matching in tags): id of first question in matching range
matchingEnd (only if .matching in tags): id of last question in matching range

The "text" of a question, response, answer, or hint may be a unicode string or a
[trans_to-text, devanagari] pair of unicode strings, where the trans_to program
argument indicates the transliteration scheme of the first element.

HTML markups are interpreted in all text.

The answer of a sequence question is automatically the text of the following question.
"""

# from https://wiki.python.org/moin/EscapingHtml
html_escape_table = {"&": "&amp;", '"': "&quot;", "'": "&apos;", ">": "&gt;", "<": "&lt;"}
def html_escape(text):
    """Produce entities within text."""
    return "".join(html_escape_table.get(c, c) for c in text)

number_cre = re.compile(r'.\d+|\d+.\d*|\d+')
media_prefix_cre = re.compile(r'<img [^>]*src="')
isnumber = number_cre.match
from_tags = set('.iast .harvard-kyoto .itrans .velthuis .slp1 .devanagari'.split())
special_apptime_tags = '.cs .ci .ma .html'.split()

def istag(string):
    return filter(None, [c.isalnum() or c in '._ -' for c in string])

def isapptime(tag):
    return not isnumber(tag) and (not tag.startswith('.') or tag in special_apptime_tags)

def tag_filter(tags):
    return list(filter(isapptime, tags))

def process_html(html, media_prefix):
    # markdown generates <em>, which is not interpreted by browser
    html = html.replace('<em>', '<span class="em">').replace('</em>', '</span>')
    if media_prefix: # prefix media path to img src
        def prefixer(mo):
            return mo.group(0) + media_prefix + '/'
        html = re.sub(r'<img [^>]*src="', prefixer, html)
    return html

def main(args):
    """Command line invocation with argparse args."""
    global debug_mode
    tags = set()
    line_num = 1
    id_num = 0
    matching_start = None
    quiz = []

    def error(msg):
        sys.stderr.write('ERROR at line ' + str(line_num) + ': ' + msg + '\n')
        if debug_mode:
            breakpoint()
        else:
            exit()

    def unescape(text): # strip text, and remove \ from \= and \/ sequences
        return re.sub(r'\\([=/]?)', r'\1', text.strip())

    def do_text(text, translit=False):
        text = unescape(text)
        if markdown_mode:
            text = markdown(text)
        if translit:
            return (translate(text, trans_from, args.trans_to),
                    translate(text, trans_from, 'devanagari'))
        elif qtags.intersection(['.html', '.md']):
            return str(process_html(text, args.media))
        else:
            return html_escape(text)

    def end_matching():
        for i in range(matching_start, len(quiz)):
            quiz[i]['matchingBegin'] = matching_start
            quiz[i]['matchingEnd'] = len(quiz) - 1

    if args.format_help:
        print FORMAT_HELP
        return
    if args.test_input:
        print test
        return

    if args.outfile:
        writer = UTF8WRITER(args.outfile)
    else:
        writer = UTF8WRITER(sys.stdout)

    _input = None
    if args.test:
        _input = test
        debug_mode = True
    elif str(args.infile) == 'None':
        _input = UTF8READER(sys.stdin).read()
    else:
        _input = codecs.open(str(args.infile), "r", "utf-8").read()
    if not _input.startswith(';'):
        error('input must start with semicolon, not: "' + _input[:5] + '"')
    if '.md' in _input:
        from markdown import markdown

    for elt in _input[1:].split('\n;'):
        markdown_mode = False
        devanagari = False
        elt = elt.strip()
        if not elt:
            error('bad syntax')
        if ';' not in elt:  # tag range
            not_tags = elt.startswith('/')
            range_tags = [tag.strip() for tag in elt[1 if not_tags else 0 : ].split(',')]
            if not all([istag(tag) for tag in range_tags]):
                error('bad range tag')
            if not_tags:
                if not all([tag in tags for tag in range_tags]):
                    error('closing tag without opening')
                if '.matching' in range_tags:
                    end_matching()
                tags.difference_update(range_tags)
            else:
                if not all([tag not in tags for tag in range_tags]):
                    error('tag already active')
                tags.update(range_tags)
                if '.matching' in tags:
                    matching_start = id_num
        else:
            q = {}
            tags_str, question = elt.split(';', 1)

            # tag processing
            qtaglst = filter(None, map(unescape, tags_str.split(',')))
            if filter(None, [not istag(tag) for tag in qtaglst]):
                error('bad tag')
            qtags = set(qtaglst)
            if len(qtags) < len(qtaglst):
                error('duplicate tag')
            intersection = qtags & tags
            if intersection:
                error('tag(s) in context: ' + str(intersection))
            qtags |= tags
            if len(set(['.cs', '.ci']) & qtags) > 1:
                error('.cs and .ci tags are mutually exclusive')
            if '.md' in qtags:
                markdown_mode = True
                qtags.add('.html')
            q_from_tags = from_tags.intersection(qtags)
            if len(q_from_tags) > 1:
                error('at most one from tag')
            trans_from = q_from_tags.pop()[1:] if q_from_tags else 'itrans'
            numbers = filter(isnumber, qtags)
            if len(numbers) > 1:
                error('number tag already present')
            elif len(numbers) == 1:
                q['number'] = float(numbers[0])

            # question, response, and hint response processing
            if not question:
                error('no question body')
            qlst = re.split(r'\s\?', question)
            hints = [do_text(s, '.th' in qtags) for s in qlst[1:]]
            if hints:
                q['hints'] = hints
            trlst = re.split(r'\s(?==)|\s(?=/)', qlst[0])
            q['text'] = do_text(trlst[0], '.tq' in qtags)
            responses = [(r[0] == '=', do_text(r[1:], '.tr' in qtags))
                         for r in trlst[1:]]
            if '.text' in qtags:
                if responses or hints:
                    error('no hints or responses in text mode')
                q['type'] = 'text'
            elif '.lineseq' in qtags:
                if responses or hints:
                    error('no responses or hints in .lineseq mode')
                lines = [do_text(line, '.tq' in qtags)
                         for line in q['text'].split('\n')]
                if len(lines) < 2:
                    error('at least two lines in .lineseq mode')
                for line in lines[:-2]:
                    aq = {'id': id_num,
                          'text': line,
                          'tags': tag_filter(qtags),
                          'type': 'mind'
                         }
                    if q.has_key('number'):
                        aq['number'] = q['number']
                    quiz.append(aq)
                    id_num += 1
                q['type'] = ''
                q['text'] = lines[-2]
                q['answer'] = lines[-1]
            elif not responses:
                q['type'] = 'mind' # sequence question
            elif len(responses) == 1:
                response = responses[0][1]
                if type(response) == unicode and response.lower() in ['t', 'f', 'true', 'false']:
                    q['type'] = 'true-false'
                    q['answer'] = response.lower() in ['t', 'true']
                else:
                    q['type'] = 'matching' if '.matching' in tags else 'mind'
                    q['answer'] = response
            else:
                q['responses'] = responses
                q['type'] = 'multiple-choice'
                if len(filter(None, map(lambda r: r[0], responses))) != 1:
                    if '.ma' not in qtags:
                        error('"ma" tag required if not one answer')
            q['tags'] = tag_filter(qtags)
            q['id'] = id_num
            id_num += 1
            quiz.append(q)
        line_num += len(elt.split('\n')) + 1
    if '.matching' in tags:
        end_matching()
    json.dump(quiz, writer, indent=1, sort_keys=True)

def get_args():
    formatter = argparse.RawDescriptionHelpFormatter
    p = argparse.ArgumentParser(
        description=__doc__,
        epilog=EPILOG,
        formatter_class=formatter)
    p.add_argument('infile', nargs='?', type=str,
                   help='compact format input file, default stdin')
    p.add_argument('outfile', nargs='?',
                   type=argparse.FileType('w'),
                   help='json format file, default stdout')
    p.add_argument('--trans_to', type=str, default='iast',
                   help='transliteration translation output form (default itrans)')
    p.add_argument('-m', '--media', type=str, default='',
                   help='prefix added to html img src, default none')
    p.add_argument('-t', '--test', action='store_true',
                   help='run with test variable value as input')
    p.add_argument('--test_input', action='store_true',
                   help='print test input text and quit')
    p.add_argument('--format_help', action='store_true',
                   help='print format documentation and quit')
    args = p.parse_args()
    return args

test = u""";foo,cs,bar
;;qtext =a /b
;baz;q =t
;a,1;qt
;;q with
?    hint \?questionmark
;/foo,bar
;;mq
/a
=b
;c;mcq
;;mind =answer a \= b
;.lineseq;
one
two
three
;.matching
;;a =A
;;b =B
;;c =C
;/.matching
;.devanagari
;.tq;श्रद्धावाँल्ल =f
;/.devanagari
;.iast,.tr;pranava =om
;.md;*emphasis* =**bold**
;.matching
;;a =A
;;b =B
"""

# "gulp cmd -a cdtest" runs 'cd tools; cdeck.py -t -m "prefix"'
test = u""";.md;![Alt text](to/img.jpg "Optional title")"""

if __name__ == "__main__":
    main(get_args())
