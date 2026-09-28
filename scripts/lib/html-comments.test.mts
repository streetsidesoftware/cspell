import { describe, expect, test } from 'vitest';

import { findHtmlComments, formatHtmlComment } from './html-comments.mts';

const fence = '```';

function locations(markdown: string): string[] {
    return findHtmlComments(markdown).map((c) => `${c.line}:${c.column}:${c.closed ? 'closed' : 'unclosed'}`);
}

describe('findHtmlComments', () => {
    test.each`
        name                                  | markdown                                     | expected
        ${'no comments'}                      | ${'Fixes the cache.\n\n- one\n- two'}        | ${[]}
        ${'a comment in a sentence'}          | ${'Before <!-- hidden --> after.'}           | ${['1:8:closed']}
        ${'a multi-line comment'}             | ${'Line one\n\n<!--\nhidden\n-->\nLine two'} | ${['3:1:closed']}
        ${'the bot style, with three dashes'} | ${'Report\n<!---\ncspell:disable\n--->\n'}   | ${['2:1:closed']}
        ${'an unclosed comment'}              | ${'Before\n  <!-- never closed\nAfter'}      | ${['2:3:unclosed']}
        ${'several comments'}                 | ${'<!-- a -->\ntext <!-- b -->\n<!-- c'}     | ${['1:1:closed', '2:6:closed', '3:1:unclosed']}
        ${'CRLF line endings'}                | ${'Line one\r\nLine two <!-- x -->\r\n'}     | ${['2:10:closed']}
    `('reports $name', ({ markdown, expected }) => {
        expect(locations(markdown)).toEqual(expected);
    });

    // cspell directives are HTML comments, so PRs about cspell show them in code blocks.
    test.each`
        name                                     | markdown
        ${'a fenced code block'}                 | ${`Example:\n\n${fence}md\n<!-- cspell:ignore word -->\n${fence}\n`}
        ${'a code block at the start'}           | ${`${fence}\n<!-- x -->\n${fence}\nAfter.`}
        ${'HTML shown in a code block'}          | ${`${fence}html\n<div>\n<!-- x -->\n</div>\n${fence}`}
        ${'a longer closing fence'}              | ${`${fence}\n<!-- x -->\n${fence}${fence}`}
        ${'a shorter fence inside a longer one'} | ${`\`${fence}\n<!-- a -->\n${fence}\n<!-- b -->\n\`${fence}`}
        ${'a code block after HTML and a blank'} | ${`<div>\n\n${fence}\n<!-- x -->\n${fence}\n\n</div>`}
        ${'a code block after a list'}           | ${`- item\n\n${fence}\n<!-- cspell:ignore x -->\n${fence}\n`}
        ${'CRLF line endings'}                   | ${`Use:\r\n\r\n${fence}md\r\n<!-- cspell:ignore w -->\r\n${fence}\r\n`}
        ${'two code blocks'}                     | ${`a\n\n${fence}\n<!-- cspell:x -->\n${fence}\n\nb\n\n${fence}md\n<!-- cspell:y -->\n${fence}\n`}
        ${'a fence nested in a longer one'}      | ${`a\n\n\`${fence}\n${fence}md\n<!-- cspell:z -->\n${fence}\n\`${fence}\n`}
    `('ignores a comment in a code block: $name', ({ markdown }) => {
        expect(locations(markdown)).toEqual([]);
    });

    test.each`
        name                                                 | markdown                                                                        | expected
        ${'inline code'}                                     | ${'Use `<!-- cspell:ignore word -->` to ignore it.'}                            | ${['1:6:closed']}
        ${'a fence without a blank line before it'}          | ${`Text\n${fence}\n<!-- x -->\n${fence}`}                                       | ${['3:1:closed']}
        ${'a fence right after an HTML tag'}                 | ${`<div>\n${fence}\n<!-- x -->\n${fence}\n</div>`}                              | ${['3:1:closed']}
        ${'an unclosed fence'}                               | ${`Text\n\n${fence}\n<!-- x -->`}                                               | ${['4:1:closed']}
        ${'a fence inside a quote'}                          | ${`> ${fence}\n> <!-- x -->\n> ${fence}`}                                       | ${['2:3:closed']}
        ${'an indented code block'}                          | ${'Example:\n\n    <!-- x -->\n'}                                               | ${['3:5:closed']}
        ${'a backtick fence with a backtick in info'}        | ${`${fence}a\`b\n<!-- x -->\n${fence}`}                                         | ${['2:1:closed']}
        ${'a <pre> block across blank lines'}                | ${`<pre>\n\n${fence}\n<!-- x -->\n${fence}\n\n</pre>`}                          | ${['4:1:closed']}
        ${'a comment after a block with an open <!--'}       | ${`${fence}\n<!-- a\n${fence}\n\n<!-- b -->`}                                   | ${['5:1:closed']}
        ${'an indented fence in a list item'}                | ${`- item\n\n  ${fence}\n<!-- HIDDEN -->\n  ${fence}\n`}                        | ${['4:1:closed']}
        ${'a <?php block across blank lines'}                | ${`<?php\n\n${fence}\n<!-- HIDDEN -->\n${fence}\n?>\n`}                         | ${['4:1:closed']}
        ${'a lone CR closing the fence'}                     | ${`text\n\n${fence}\nx\r${fence}\r\n<!-- HIDDEN -->\n${fence}\n`}               | ${['5:1:closed']}
        ${'an indented closing fence'}                       | ${`text\n\n${fence}\nx\n  ${fence}\n<!-- HIDDEN -->\n${fence}\n`}               | ${['6:1:closed']}
        ${'a tilde fence'}                                   | ${'Example:\n\n~~~\n<!-- x -->\n~~~\n'}                                         | ${['4:1:closed']}
        ${'a tilde fence around a backtick fence'}           | ${`~~~\n\n${fence}\n~~~\n<!-- HIDDEN -->\n${fence}`}                            | ${['5:1:closed']}
        ${'a fence under a text line takes a closing fence'} | ${`text\n${fence}\nx\n\n${fence}\n<!-- HIDDEN -->\n${fence}\n`}                 | ${['6:1:closed']}
        ${'an indented fence takes a closing fence'}         | ${`text\n\n  ${fence}\nx\n\n${fence}\n<!-- HIDDEN -->\n${fence}\n`}             | ${['7:1:closed']}
        ${'a longer fence under a text line'}                | ${`text\n\`${fence}\nx\n${fence}\n\n\`${fence}\n<!-- HIDDEN -->\n\`${fence}\n`} | ${['7:1:closed']}
    `('reports a comment that is not in a code block: $name', ({ markdown, expected }) => {
        expect(locations(markdown)).toEqual(expected);
    });

    test('handles deeply nested Markdown', () => {
        expect(locations('>'.repeat(100_000) + ' x\n\n<!-- hidden -->')).toEqual(['3:1:closed']);
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
