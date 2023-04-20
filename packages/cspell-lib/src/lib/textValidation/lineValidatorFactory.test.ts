import type { SpellingDictionary } from 'cspell-dictionary';
import { createCollection, createSpellingDictionary, createSuggestDictionary } from 'cspell-dictionary';
import { describe, expect, test } from 'vitest';

import { textValidatorFactory } from './lineValidatorFactory.js';

const oc = expect.objectContaining;

describe('lineValidatorFactory', () => {
    test.each`
        word                     | expected
        ${'one'}                 | ${[]}
        ${'three etc.'}          | ${[]}
        ${'one two three etc'}   | ${[oc({ text: 'etc' })]}
        ${'three four five one'} | ${[oc({ text: 'five' })]}
        ${'lion'}                | ${[oc({ text: 'lion', suggestionsEx: [oc({ word: 'tiger', isPreferred: true })] })]}
    `('textValidatorFactory', ({ word, expected }) => {
        const dict = getDict();
        const tv = textValidatorFactory(dict, { ignoreCase: true, minWordLength: 1 });
        const r = [...tv.validate({ text: word, range: [10, 10 + word.length] })];
        expect(r).toEqual(expected);
    });
});

let dict: SpellingDictionary | undefined;

function getDict(): SpellingDictionary {
    if (dict) return dict;
    const words = 'one two three four etc. a.b.c'.split(/\s/g);
    const suggestions = 'apple:pear lion:tiger'.split(/\s/g);
    const d = createCollection(
        [
            createSpellingDictionary(words, 'words', 'tests'),
            createSuggestDictionary(suggestions, 'suggestions', 'test'),
        ],
        'collection',
        'tests'
    );
    dict = d;
    return d;
}
