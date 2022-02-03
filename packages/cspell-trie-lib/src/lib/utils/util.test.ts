import { regexQuote, replaceAll, replaceAllFactory } from './util';

describe('util', () => {
    // cspell:ignore aabbaab
    test.each`
        text         | match   | replaceWith | expected
        ${''}        | ${''}   | ${''}       | ${''}
        ${'hello'}   | ${''}   | ${'-'}      | ${'-h-e-l-l-o-'}
        ${'aabbaab'} | ${'ab'} | ${'AB'}     | ${'aABbaAB'}
        ${'aabbaab'} | ${'a'}  | ${'B'}      | ${'BBbbBBb'}
    `('replaceAll [$text, $match, $replaceWith]', ({ text, match, replaceWith, expected }) => {
        expect(replaceAll(text, match, replaceWith)).toBe(expected);
    });

    test.each`
        text       | expected
        ${'hello'} | ${'hello'}
        ${'+'}     | ${'\\+'}
    `('regexQuote $text', ({ text, expected }) => {
        const r = regexQuote(text);
        expect(r).toBe(expected);
        expect(RegExp(r).test(text)).toBe(true);
    });

    test.each`
        texts                          | match   | replaceWith | expected
        ${['']}                        | ${''}   | ${''}       | ${['']}
        ${['hello']}                   | ${''}   | ${''}       | ${['hello']}
        ${['hello']}                   | ${''}   | ${'-'}      | ${['-h-e-l-l-o-']}
        ${['aabbaab']}                 | ${'ab'} | ${'AB'}     | ${['aABbaAB']}
        ${['aabbaab', 'aa', 'aba']}    | ${'a'}  | ${'B'}      | ${['BBbbBBb', 'BB', 'BbB']}
        ${['aa+bb+aab', 'a+a', 'aba']} | ${'+'}  | ${'_'}      | ${['aa_bb_aab', 'a_a', 'aba']}
    `('replaceAllFactory [$texts, $match, $replaceWith]', ({ texts, match, replaceWith, expected }) => {
        const fn = replaceAllFactory(match, replaceWith);
        expect(texts.map(fn)).toEqual(expected);
    });
});
