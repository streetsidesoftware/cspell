import { describe, expect, test } from 'vitest';

import { readSampleFile } from '../../test/samples.js';
import { levenshteinDistance, selectNearestWords } from './levenshtein.js';

const sampleWords = readSampleFile('wordsForLevenshtein.txt').then((doc) => Object.freeze(doc.split('\n')));
const sampleWordsSorted = sampleWords.then((words) => Object.freeze([...words].sort()));

describe('levenshtein', () => {
    // cspell:ignore ababa
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

describe('levenshtein nearest words', () => {
    test('selectNearestWords', () => {
        const results = selectNearestWords('talk', ['walk', 'talked'], 5, 3);
        expect(results).toEqual([
            { word: 'walk', dist: 1 },
            { word: 'talked', dist: 2 },
        ]);
    });

    test.each`
        word         | maxEdits | num  | contains
        ${'helpful'} | ${3}     | ${5} | ${[{ word: 'helpful', dist: 0 }]}
        ${'walk'}    | ${3}     | ${5} | ${[{ word: 'talks', dist: 2 }]}
        ${'toy-box'} | ${5}     | ${5} | ${[{ word: 'toy', dist: 4 }]}
        ${'talker'}  | ${5}     | ${5} | ${[{ word: 'talked', dist: 1 }]}
        ${'alk'}     | ${5}     | ${5} | ${[{ word: 'talk', dist: 1 }, { word: 'walk', dist: 1 }]}
    `('selectNearestWords $word edits: $maxEdits num: $num', async ({ word, maxEdits, num, contains }) => {
        const words = await sampleWordsSorted;

        const result = selectNearestWords(word, words, num, maxEdits);
        expect(result).toEqual(expect.arrayContaining(contains));
        expect(result).toMatchSnapshot();
    });
});
