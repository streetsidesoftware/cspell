import { describe, expect, test } from 'vitest';

import { expandBraces } from './braceExpansion.js';

describe('Validate braceExpansion', () => {
    test('expandBraces should return an array of expanded strings', () => {
        // Test case 1
        const result1 = expandBraces('a{b,c}d', { begin: '{', end: '}', sep: ',' });
        expect(result1).toEqual(['abd', 'acd']);

        // Test case 2
        const result2 = expandBraces('z{a,b,c}', { begin: '{', end: '}', sep: ',' });
        expect(result2).toEqual(['za', 'zb', 'zc']);
    });

    /* cspell:ignore unchecker */

    test.each`
        text                           | expected
        ${'hello'}                     | ${s('hello')}
        ${'remember(s|ed|ing|er|)'}    | ${s('remembers|remembered|remembering|rememberer|remember')}
        ${'remember(s|e(d|r)|ing|)'}   | ${s('remembers|remembered|rememberer|remembering|remember')}
        ${'remember(s|e(d|r)|ing|'}    | ${s('remembers|remembered|rememberer|remembering|remember')}
        ${'(un|)check(s|e(d|r)|ing|)'} | ${s('unchecks|checks|unchecked|checked|unchecker|checker|unchecking|checking|uncheck|check')}
        ${'(un|check(s|e(d|r)|ing|)'}  | ${s('un|checks|checked|checker|checking|check')}
        ${'(un|re|)check(ed|)'}        | ${s('unchecked|rechecked|checked|uncheck|recheck|check')}
    `('expandBraces $text', ({ text, expected }) => {
        expect(expandBraces(text)).toEqual(expected);
    });
});

function s(text: string, split = '|'): string[] {
    return text.split(split);
}
