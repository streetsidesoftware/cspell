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

    // cspell directives are HTML comments, so PRs about cspell show them as code.
    test.each`
        name                                     | markdown
        ${'inline code'}                         | ${'Use `<!-- cspell:ignore word -->` to ignore it.'}
        ${'two code spans on a line'}            | ${'Use `<!-- cspell:disable -->` and `<!-- cspell:enable -->`.'}
        ${'a double-backtick code span'}         | ${'Like `` a ` <!-- x --> b `` here.'}
        ${'a fenced code block'}                 | ${`Example:\n\n${fence}md\n<!-- cspell:ignore word -->\n${fence}\n`}
        ${'a fenced block at the start'}         | ${`${fence}\n<!-- x -->\n${fence}\nAfter.`}
        ${'a tilde fence'}                       | ${'Example:\n\n~~~\n<!-- x -->\n~~~\n'}
        ${'HTML shown in a fenced block'}        | ${`${fence}html\n<div>\n<!-- x -->\n</div>\n${fence}`}
        ${'an unclosed fence, to the end'}       | ${`Text\n\n${fence}\n<!-- x -->`}
        ${'a longer closing fence'}              | ${`${fence}\n<!-- x -->\n${fence}${fence}`}
        ${'a shorter fence inside a longer one'} | ${`\`${fence}\n<!-- a -->\n${fence}\n<!-- b -->\n\`${fence}`}
        ${'a fence after HTML and a blank line'} | ${`<div>\n\n${fence}\n<!-- x -->\n${fence}\n\n</div>`}
    `('ignores a comment shown as code: $name', ({ markdown }) => {
        expect(locations(markdown)).toEqual([]);
    });

    // Layouts where GitHub hides the comment even though backticks or fences are nearby.
    test.each`
        name                                          | markdown
        ${'a fence right after an HTML tag'}          | ${`<div>\n${fence}\n<!-- x -->\n${fence}\n</div>`}
        ${'a fence a line after an HTML tag'}         | ${`<div>\ntext\n${fence}\n<!-- x -->\n${fence}`}
        ${'a <pre> block across blank lines'}         | ${`<pre>\n\n${fence}\n<!-- x -->\n${fence}\n\n</pre>`}
        ${'backticks inside an HTML block'}           | ${'<div>\n`<!-- x -->`\n</div>'}
        ${'backticks in HTML attributes'}             | ${'See x <a title="`"><!-- approve --><b title="`"> here.'}
        ${'an autolink in the paragraph'}             | ${'`<!-- x -->` <https://example.com>'}
        ${'an escaped opening backtick'}              | ${'\\`<!-- x -->`'}
        ${'mismatched backtick runs'}                 | ${'``<!-- x -->`'}
        ${'a code span across list items'}            | ${'- a `\n- b <!-- x --> `'}
        ${'a code span across table cells'}           | ${'| `a | <!-- x --> | b` |'}
        ${'a backtick fence with a backtick in info'} | ${`${fence}a\`b\n<!-- x -->\n${fence}`}
    `('reports a hidden comment: $name', ({ markdown }) => {
        expect(findHtmlComments(markdown).length).toBeGreaterThan(0);
    });

    // Code that isn't recognized, so the comment is reported. A false alarm, but never a miss.
    test.each`
        name                              | markdown
        ${'a fence without a blank line'} | ${`Text\n${fence}\n<!-- x -->\n${fence}`}
        ${'a fence inside a quote'}       | ${`> ${fence}\n> <!-- x -->\n> ${fence}`}
        ${'an indented code block'}       | ${'Example:\n\n    <!-- x -->\n'}
    `('reports, to be safe: $name', ({ markdown }) => {
        expect(findHtmlComments(markdown).length).toBeGreaterThan(0);
    });

    test('handles deeply nested Markdown without recursion', () => {
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
