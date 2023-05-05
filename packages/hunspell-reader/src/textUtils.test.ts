import { describe, expect, test } from 'vitest';

import { escapeUnicodeCode, removeAccents, removeLooseAccents, toRange } from './textUtils.js';

describe('textUtils', () => {
    // cspell:ignore résumé sume
    test.each`
        text                                        | regexp       | expected
        ${'abc'}                                    | ${undefined} | ${'"abc"'}
        ${'café'}                                   | ${undefined} | ${'"café"'}
        ${'café'.normalize('NFD')}                  | ${undefined} | ${'"cafe\\u0301"'}
        ${'à la mode café résumé'.normalize('NFD')} | ${undefined} | ${'"a\\u0300 la mode cafe\\u0301 re\\u0301sume\\u0301"'}
        ${'abc\nabc'}                               | ${undefined} | ${'"abc\\nabc"'}
    `('escapeUnicodeCode $text', ({ text, regexp, expected }) => {
        const result = escapeUnicodeCode(JSON.stringify(text), regexp);
        expect(result).toBe(expected);
        expect(JSON.parse(result)).toBe(text);
    });

    test.each`
        text                                      | minLength    | expected
        ${''}                                     | ${undefined} | ${''}
        ${'abc'}                                  | ${undefined} | ${'abc'}
        ${'abc'}                                  | ${1}         | ${'a-c'}
        ${'abc'}                                  | ${3}         | ${'a-c'}
        ${'abcd'}                                 | ${undefined} | ${'a-d'}
        ${'abcdefg'}                              | ${undefined} | ${'a-g'}
        ${'abcdefg'}                              | ${7}         | ${'a-g'}
        ${'abcdefg'}                              | ${8}         | ${'abcdefg'}
        ${'abcd.abcdef.gh'}                       | ${undefined} | ${'a-d.a-f.gh'}
        ${'café'}                                 | ${undefined} | ${'café'}
        ${'\u0300\u0300\u0301\u0302\u0303\u0308'} | ${undefined} | ${'\u0300\u0300-\u0303\u0308'}
    `('toRange $text', ({ text, minLength, expected }) => {
        const result = toRange(text, minLength);
        expect(result).toBe(expected);
    });

    test.each`
        text                       | expected
        ${'abc'}                   | ${'abc'}
        ${'café'}                  | ${'cafe'}
        ${'café'.normalize('NFD')} | ${'cafe'}
        ${'café café'}             | ${'cafe cafe'}
    `('removeAccents $text', ({ text, expected }) => {
        expect(removeAccents(text)).toBe(expected);
    });

    test.each`
        text                             | expected
        ${'abc'}                         | ${'abc'}
        ${'café'}                        | ${'café'}
        ${'café'.normalize('NFD')}       | ${'cafe'}
        ${'café cafe\u0300'}             | ${'café cafe'}
        ${'cafe\u0301'.normalize('NFC')} | ${'café'}
    `('removeLooseAccents $text', ({ text, expected }) => {
        expect(removeLooseAccents(text)).toBe(expected);
    });
});
