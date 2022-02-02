import { replaceAll, replaceAllFactory } from './util';

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
        texts                       | match   | replaceWith | expected
        ${['']}                     | ${''}   | ${''}       | ${['']}
        ${['hello']}                | ${''}   | ${''}       | ${['hello']}
        ${['hello']}                | ${''}   | ${'-'}      | ${['-h-e-l-l-o-']}
        ${['aabbaab']}              | ${'ab'} | ${'AB'}     | ${['aABbaAB']}
        ${['aabbaab', 'aa', 'aba']} | ${'a'}  | ${'B'}      | ${['BBbbBBb', 'BB', 'BbB']}
    `('replaceAllFactory [$texts, $match, $replaceWith]', ({ texts, match, replaceWith, expected }) => {
        const fn = replaceAllFactory(match, replaceWith);
        expect(texts.map(fn)).toEqual(expected);
    });
});
