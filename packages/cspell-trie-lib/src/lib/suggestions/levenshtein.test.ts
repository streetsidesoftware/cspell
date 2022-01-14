import { levenshteinDistance } from './levenshtein';

describe('levenshtein', () => {
    test.each`
        left          | right        | expected
        ${'abc'}      | ${'abc'}     | ${0}
        ${'abc'}      | ${'ab'}      | ${1}
        ${'abc'}      | ${''}        | ${3}
        ${'kitten'}   | ${'sitting'} | ${3}
        ${'Saturday'} | ${'Sunday'}  | ${3}
        ${'ab'}       | ${'ba'}      | ${1}
        ${'aba'}      | ${'bab'}     | ${2}
        ${'abab'}     | ${'baba'}    | ${2}
        ${'abab'}     | ${'ababa'}   | ${1}
        ${'appear'}   | ${'apple'}   | ${3}
        ${'appease'}  | ${'apple'}   | ${3}
    `('levenshteinDistance "$left" vs "$right"', ({ left, right, expected }) => {
        expect(levenshteinDistance(left, right)).toBe(expected);
        expect(levenshteinDistance(right, left)).toBe(expected);
    });
});

// cspell:ignore ababa
