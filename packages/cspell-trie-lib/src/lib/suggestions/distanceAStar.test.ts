import { distanceAStar } from './distanceAStar';
import { levenshteinDistance } from './levenshtein';

describe('distanceAStar', () => {
    test.each`
        wordA        | wordB
        ${''}        | ${''}
        ${'apple'}   | ${'apple'}
        ${'apple'}   | ${''}
        ${'apple'}   | ${'apples'}
        ${'apple'}   | ${'maple'}
        ${'grapple'} | ${'maples'}
    `('distanceAStar vs Levenshtein "$wordA" "$wordB"', ({ wordA, wordB }) => {
        const expected = levenshteinDistance(wordA, wordB) * 100;
        expect(distanceAStar(wordA, wordB)).toBe(expected);
        expect(distanceAStar(wordB, wordA)).toBe(expected);
    });
});
