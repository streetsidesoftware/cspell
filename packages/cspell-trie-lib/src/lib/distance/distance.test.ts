import { editDistance, editDistanceWeighted, createWeightedMap, updatedWeightedMap } from './distance';

describe('distance', () => {
    test.each`
        wordA     | wordB     | expected
        ${''}     | ${''}     | ${0}
        ${'ab'}   | ${'ba'}   | ${100}
        ${'bite'} | ${'bate'} | ${100}
    `('editDistance "$wordA" vs "$wordB"', ({ wordA, wordB, expected }) => {
        expect(editDistance(wordA, wordB)).toBe(expected);
        expect(editDistance(wordB, wordA)).toBe(expected);
        expect(editDistance(wordA, wordB, 200)).toBe(expected * 2);
    });

    const weights = createWeightedMap([
        {
            map: 'aeiou', // cspell:disable-line
            replace: 50,
            insDel: 75,
            swap: 45,
        },
        {
            description: 'Vowels',
            map: 'aáâäãåeéêëiíîïoóôöõuúûüyÿ', // cspell:disable-line
            insDel: 50,
            replace: 25, // Replacing one vowel with another is cheap
            swap: 25, // Swapping vowels are cheap
        },
        {
            description: 'Vowel Accents',
            map: 'aáâäãå|eéêë|iíîï|oóôöõ|uúûü|yÿ', // cspell:disable-line
            replace: 10, // Make it cheap to add / remove an accent.
        },
    ]);

    updatedWeightedMap(weights, {
        map: 't(tt)|p(pp)|e(ee)(ea)|l(ll)|a(aa)|o(oo)(oh)(oa)(ao)(ou)|',
        replace: 55,
    });

    test.each`
        wordA                                | wordB       | expected
        ${''}                                | ${''}       | ${0}
        ${'ab'}                              | ${'ba'}     | ${100}
        ${'botle' /* cspell:disable-line */} | ${'bottle'} | ${55}
        ${'cafe'}                            | ${'café'}   | ${10}
        ${'tee'}                             | ${'tea'}    | ${25}
        ${'trie'}                            | ${'tree'}   | ${25}
    `('editDistance "$wordA" vs "$wordB"', ({ wordA, wordB, expected }) => {
        expect(editDistanceWeighted(wordA, wordB, weights)).toBe(expected);
        expect(editDistanceWeighted(wordB, wordA, weights)).toBe(expected);
    });
});
