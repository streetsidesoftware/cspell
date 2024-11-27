import type { SpellingDictionary } from 'cspell-dictionary';
import { createCollection, createSpellingDictionary, createSuggestDictionary } from 'cspell-dictionary';
import { describe, expect, test } from 'vitest';

import { textValidatorFactory } from './lineValidatorFactory.js';

const oc = <T>(obj: T) => expect.objectContaining(obj);

describe('lineValidatorFactory', () => {
    // cspell:ignore 𐀀𐃘

    test.each`
        word                     | expected
        ${'one'}                 | ${[]}
        ${'three etc.'}          | ${[]}
        ${'three etc. 𐀀𐃘'}       | ${[]}
        ${'flip-flop'}           | ${[oc({ text: 'flip-flop', isFlagged: true })]}
        ${'one flip-flop.'}      | ${[oc({ text: 'flip-flop', isFlagged: true })]}
        ${'one two three etc'}   | ${[oc({ text: 'etc' })]}
        ${'three four five one'} | ${[oc({ text: 'five' })]}
        ${'lion'}                | ${[oc({ text: 'lion', suggestionsEx: [oc({ word: 'tiger', isPreferred: true })] })]}
    `('textValidatorFactory', ({ word, expected }) => {
        const dict = getDict();
        const tv = textValidatorFactory(dict, { ignoreCase: true, minWordLength: 3 });
        const r = [...tv.validate({ text: word, range: [10, 10 + word.length] })];
        expect(r).toEqual(expected);
    });
});

let dict: SpellingDictionary | undefined;

function getDict(): SpellingDictionary {
    if (dict) return dict;
    const words = 'one two three four etc. a.b.c !flip-flop'.split(' ');
    const suggestions = 'apple:pear lion:tiger'.split(' ');
    const d = createCollection(
        [
            createSpellingDictionary(words, 'words', 'tests'),
            createSuggestDictionary(suggestions, 'suggestions', 'test'),
        ],
        'collection',
        'tests',
    );
    dict = d;
    return d;
}
