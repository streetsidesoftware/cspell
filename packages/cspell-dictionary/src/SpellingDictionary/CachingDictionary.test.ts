import { describe, expect, test } from 'vitest';

import { createCachingDictionary } from './CachingDictionary.js';
import { createSpellingDictionary } from './createSpellingDictionary.js';
import { createCollection } from './SpellingDictionaryCollection.js';
import { createSuggestDictionary } from './SuggestDictionary.js';

const oc = expect.objectContaining;

describe('CachingDictionary', () => {
    const words = ['apple', 'banana', 'orange', 'grape', 'mango', '!pear'];
    const dictWords = createSpellingDictionary(words, '[words]', 'source');
    const sugDict = createSuggestDictionary(['red:green', 'up:down'], '[suggestions]', 'source');
    const dict = createCollection([dictWords, sugDict], 'collection');

    test('hits', () => {
        const cd = createCachingDictionary(dict, {});
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('Apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.stats()).toEqual(oc({ has: { hits: 4, misses: 2, swaps: 0 } }));
    });

    test.each`
        word         | expected
        ${'apple'}   | ${true}
        ${'Apple'}   | ${true}
        ${'BANANA'}  | ${true}
        ${'bananas'} | ${false}
        ${'pear'}    | ${false}
    `('has $word', ({ word, expected }) => {
        const cd = createCachingDictionary(dict, {});
        expect(cd.has(word)).toBe(expected);
    });

    test.each`
        word         | expected
        ${'apple'}   | ${false}
        ${'Apple'}   | ${false}
        ${'BANANA'}  | ${false}
        ${'bananas'} | ${false}
        ${'pear'}    | ${false}
    `('isNoSuggestWord $word', ({ word, expected }) => {
        const cd = createCachingDictionary(dict, {});
        expect(cd.isNoSuggestWord(word)).toBe(expected);
    });

    test.each`
        word         | expected
        ${'apple'}   | ${false}
        ${'Apple'}   | ${false}
        ${'BANANA'}  | ${false}
        ${'bananas'} | ${false}
        ${'pear'}    | ${true}
    `('isForbidden $word', ({ word, expected }) => {
        const cd = createCachingDictionary(dict, {});
        expect(cd.isForbidden(word)).toBe(expected);
    });

    test.each`
        word       | expected
        ${'apple'} | ${[]}
        ${'up'}    | ${[{ word: 'down', cost: 1, isPreferred: true }]}
        ${'red'}   | ${[{ word: 'green', cost: 1, isPreferred: true }]}
        ${'green'} | ${[]}
    `('getPreferredSuggestions $word', ({ word, expected }) => {
        const cd = createCachingDictionary(dict, {});
        expect(cd.getPreferredSuggestions(word)).toEqual(expected);
    });
});
