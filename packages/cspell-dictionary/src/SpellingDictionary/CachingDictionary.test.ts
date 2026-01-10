import { describe, expect, test } from 'vitest';

import {
    createCachingDictionary,
    dictionaryCacheClearLog,
    dictionaryCacheEnableLogging,
    dictionaryCacheGetLog,
} from './CachingDictionary.js';
import { createSpellingDictionary } from './createSpellingDictionary.js';
import { createCollection } from './SpellingDictionaryCollection.js';
import { createSuggestDictionary } from './SuggestDictionary.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

// cspell:words colour

describe('CachingDictionary', () => {
    const words = [
        'apple',
        'banana',
        'orange',
        'grape',
        'mango',
        '!pear:apple',
        'color',
        ':colour:color',
        'red:green',
        'red:yellow',
    ];
    const dictWords = createSpellingDictionary(words, '[words]', 'source');
    const sugDict = createSuggestDictionary(
        ['red:green', 'up:down', 'turn:left', 'turn:right'],
        '[suggestions]',
        'source',
    );
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
        word        | expected
        ${'apple'}  | ${[]}
        ${'up'}     | ${[{ word: 'down', cost: 1, isPreferred: true }]}
        ${'red'}    | ${[{ word: 'green', cost: 1, isPreferred: true }, { word: 'yellow', cost: 2, isPreferred: true }]}
        ${'turn'}   | ${[{ word: 'left', cost: 1, isPreferred: true }, { word: 'right', cost: 2, isPreferred: true }]}
        ${'colour'} | ${[{ word: 'color', cost: 1, isPreferred: true }]}
        ${'pear'}   | ${[{ word: 'apple', cost: 1, isPreferred: true }]}
        ${'green'}  | ${[]}
    `('getPreferredSuggestions $word', ({ word, expected }) => {
        const cd = createCachingDictionary(dict, {});
        expect(cd.getPreferredSuggestions(word)).toEqual(expected);
    });

    test('test logging', () => {
        const word = 'apple';
        expect(dictionaryCacheEnableLogging(true)).toBe(true);
        dictionaryCacheClearLog();
        const cd = createCachingDictionary(dict, {});

        expect(cd.has(word)).toBe(true);
        expect(dictionaryCacheGetLog()).toEqual([oc({ method: 'has', word, miss: true })]);

        expect(cd.has(word)).toBe(true);
        expect(dictionaryCacheGetLog()).toEqual([
            oc({ method: 'has', word, miss: true }),
            oc({ method: 'has', word, miss: false }),
        ]);

        dictionaryCacheEnableLogging(false);
        dictionaryCacheClearLog();
        expect(dictionaryCacheGetLog()).toHaveLength(0);
    });
});
