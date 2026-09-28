import { describe, expect, test } from 'vitest';

import { findHtmlComments, formatHtmlComment } from './html-comments.mts';

const fence = '```';

function locations(markdown: string): string[] {
    return findHtmlComments(markdown).map((c) => `${c.line}:${c.column}:${c.closed ? 'closed' : 'unclosed'}`);
}

describe('findHtmlComments', () => {
    test.each`
        name                                  | markdown                                                             | expected
        ${'no comments'}                      | ${'Fixes the cache.\n\n- one\n- two'}                                | ${[]}
        ${'a comment in a sentence'}          | ${'Before <!-- hidden --> after.'}                                   | ${['1:8:closed']}
        ${'a multi-line comment'}             | ${'Line one\n\n<!--\nhidden\n-->\nLine two'}                         | ${['3:1:closed']}
        ${'the bot style, with three dashes'} | ${'Report\n<!---\ncspell:disable\n--->\n'}                           | ${['2:1:closed']}
        ${'an unclosed comment'}              | ${'Before\n  <!-- never closed\nAfter'}                              | ${['2:3:unclosed']}
        ${'several comments'}                 | ${'<!-- a -->\ntext <!-- b -->\n<!-- c'}                             | ${['1:1:closed', '2:6:closed', '3:1:unclosed']}
        ${'inline code'}                      | ${'Use `<!-- cspell:ignore -->` to ignore.'}                         | ${[]}
        ${'a fenced code block'}              | ${`Example:\n\n${fence}md\n<!-- cspell:ignore word -->\n${fence}\n`} | ${[]}
        ${'an indented code block'}           | ${'Example:\n\n    <!-- shown as code -->\n'}                        | ${[]}
        ${'a comment after a code block'}     | ${`${fence}\n<!-- code -->\n${fence}\n\n<!-- hidden -->`}            | ${['5:1:closed']}
        ${'CRLF line endings'}                | ${'Line one\r\nLine two <!-- x -->\r\n'}                             | ${['2:10:closed']}
    `('$name', ({ markdown, expected }) => {
        expect(locations(markdown)).toEqual(expected);
    });

    test('reports the text and length', () => {
        expect(findHtmlComments('a <!-- b --> c')).toEqual([
            { line: 1, column: 3, offset: 2, length: 10, closed: true, text: '<!-- b -->' },
        ]);
    });

    test('an unclosed comment runs to the end of the text', () => {
        const [comment] = findHtmlComments('a\n<!-- b\nc');
        expect(comment).toMatchObject({ closed: false, text: '<!-- b\nc', length: 8 });
    });
});

describe('formatHtmlComment', () => {
    test('location, kind, and length, without the text', () => {
        const [comment] = findHtmlComments('x\n  <!-- secret -->');
        expect(formatHtmlComment('pr-description.md', comment)).toBe(
            'pr-description.md:2:3 - HTML comment (closed, 15 characters)',
        );
    });
});
