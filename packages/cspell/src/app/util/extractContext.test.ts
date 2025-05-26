import { describe, expect, test } from 'vitest';

import { lineContext } from './extractContext.js';

describe('extractContext', () => {
    test.each`
        text                                          | subStr      | contextRange | expected
        ${'Hello World!'}                             | ${'Hello'}  | ${5}         | ${{ text: 'Hello World', offset: 0 }}
        ${'Hello World!'}                             | ${'World'}  | ${2}         | ${{ text: 'lo World!', offset: 3 }}
        ${'Some longer text'}                         | ${'Some l'} | ${5}         | ${{ text: 'Some longer', offset: 0 }}
        ${'☀️☀️☀️☀️☀️☀️Some longer text'}             | ${'Some'}   | ${3}         | ${{ text: '☀️☀️☀️Some long', offset: 6 }}
        ${'☀️☀️☀️☀️☀️☀️Some☀️☀️☀️☀️☀️☀️ longer text'} | ${'Some'}   | ${3}         | ${{ text: '☀️☀️☀️Some☀️☀️☀️', offset: 6 }}
        ${'😀😀😀😀😀😀Some😀😀😀😀😀😀 longer text'} | ${'Some'}   | ${3}         | ${{ text: '😀😀😀Some😀😀😀', offset: 6 }}
    `('lineContext $text, $start, $end, $contextRange', ({ text, subStr, contextRange, expected }) => {
        const start = text.indexOf(subStr);
        const end = start + subStr.length;
        const result = lineContext(text, start, end, contextRange);
        expect(result).toEqual(expected);
    });
});
