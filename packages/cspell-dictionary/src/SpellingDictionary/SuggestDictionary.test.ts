import { describe, expect, test } from 'vitest';

import { createSuggestDictionary } from './SuggestDictionary.js';

// const oc = <T>(obj: T) => expect.objectContaining(obj);
const isPreferred = true;

describe('SuggestDictionary 1', () => {
    const dictWords = ['  english:English', 'red->green', 'blue:purple', 'yellow->white'];
    const dict = createSuggestDictionary(dictWords, 'suggestions', 'test');

    test.each`
        word         | expected
        ${'red'}     | ${false}
        ${'green'}   | ${false}
        ${'blue'}    | ${false}
        ${'purple'}  | ${false}
        ${''}        | ${false}
        ${'English'} | ${false}
        ${'english'} | ${false}
    `('has of "$word"', async ({ word, expected }) => {
        expect(dict.has(word)).toEqual(expected);
    });

    test.each`
        word        | options                  | expected
        ${''}       | ${undefined}             | ${undefined}
        ${'red'}    | ${{ ignoreCase: false }} | ${undefined}
        ${'green'}  | ${{ ignoreCase: true }}  | ${undefined}
        ${'blue'}   | ${undefined}             | ${undefined}
        ${'purple'} | ${undefined}             | ${undefined}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word        | expected
        ${''}       | ${false}
        ${'red'}    | ${false}
        ${'green'}  | ${false}
        ${'blue'}   | ${false}
        ${'purple'} | ${false}
    `('isNoSuggestWord of "$word"', async ({ word, expected }) => {
        expect(dict.isNoSuggestWord(word, {})).toEqual(expected);
    });

    test.each`
        word        | expected
        ${''}       | ${false}
        ${'red'}    | ${false}
        ${'green'}  | ${false}
        ${'blue'}   | ${false}
        ${'purple'} | ${false}
    `('isForbidden of "$word"', async ({ word, expected }) => {
        expect(dict.isForbidden(word)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${''}        | ${[]}
        ${'English'} | ${[{ word: 'English', cost: 1, isPreferred: true }]}
        ${'english'} | ${[{ word: 'English', cost: 1, isPreferred: true }]}
        ${'red'}     | ${[{ cost: 1, isPreferred: true, word: 'green' }]}
        ${'green'}   | ${[]}
        ${'blue'}    | ${[{ cost: 1, isPreferred: true, word: 'purple' }]}
        ${'purple'}  | ${[]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});

describe('SuggestDictionary 2', () => {
    const dictWords = [
        '  english->English',
        "wont:won't, will not",
        'avocado:Avocado',
        'cafe->café',
        'notfound:NotFound',
        'red->green',
        'grumpy',
        'blue:purple, cyan',
        'yellow->white',
        'yellow->black',
    ];
    const dict = createSuggestDictionary(dictWords, 'suggestions', 'test');

    // cspell:ignore notworking

    test.each`
        word         | expected
        ${''}        | ${[]}
        ${'Avocado'} | ${[{ cost: 1, isPreferred, word: 'Avocado' }]}
        ${'avocado'} | ${[{ cost: 1, isPreferred, word: 'Avocado' }]}
        ${'cafe'}    | ${[{ cost: 1, isPreferred, word: 'café' }]}
        ${'English'} | ${[{ word: 'English', isPreferred, cost: 1 }]}
        ${'english'} | ${[{ word: 'English', isPreferred, cost: 1 }]}
        ${'grumpy'}  | ${[]}
        ${'red'}     | ${[{ cost: 1, isPreferred, word: 'green' }]}
        ${'green'}   | ${[]}
        ${'blue'}    | ${[{ cost: 1, isPreferred, word: 'purple' }, { cost: 2, isPreferred, word: 'cyan' }]}
        ${'yellow'}  | ${[{ cost: 1, isPreferred, word: 'white' }, { cost: 2, isPreferred, word: 'black' }]}
        ${'Grumpy'}  | ${[]}
        ${'wont'}    | ${[{ word: "won't", isPreferred, cost: 1 }, { word: 'will not', isPreferred, cost: 2 }]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${''}        | ${[]}
        ${'Avocado'} | ${[{ cost: 1, isPreferred, word: 'Avocado' }]}
        ${'avocado'} | ${[{ cost: 1, isPreferred, word: 'Avocado' }]}
        ${'cafe'}    | ${[{ cost: 1, isPreferred, word: 'café' }]}
        ${'English'} | ${[{ word: 'English', isPreferred, cost: 1 }]}
        ${'english'} | ${[{ word: 'English', isPreferred, cost: 1 }]}
        ${'grumpy'}  | ${[]}
        ${'red'}     | ${[{ cost: 1, isPreferred, word: 'green' }]}
        ${'green'}   | ${[]}
        ${'blue'}    | ${[{ cost: 1, isPreferred, word: 'purple' }, { cost: 2, isPreferred, word: 'cyan' }]}
        ${'yellow'}  | ${[{ cost: 1, isPreferred, word: 'white' }, { cost: 2, isPreferred, word: 'black' }]}
        ${'Grumpy'}  | ${[]}
        ${'wont'}    | ${[{ word: "won't", isPreferred, cost: 1 }, { word: 'will not', isPreferred, cost: 2 }]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.getPreferredSuggestions(word)).toEqual(expected);
    });

    test('getErrors', () => {
        expect(dict.getErrors?.()).toEqual([]);
    });

    test.each`
        word         | ignoreCase   | expected
        ${'purple'}  | ${true}      | ${true}
        ${'Avocado'} | ${true}      | ${true}
        ${'avocado'} | ${false}     | ${false}
        ${'cafe'}    | ${undefined} | ${false}
        ${'cafe'}    | ${true}      | ${true}
        ${'café'}    | ${true}      | ${true}
        ${'English'} | ${true}      | ${true}
        ${'english'} | ${false}     | ${false}
        ${'english'} | ${true}      | ${true}
        ${'red'}     | ${true}      | ${false}
        ${'green'}   | ${true}      | ${true}
        ${'Green'}   | ${true}      | ${true}
        ${'blue'}    | ${true}      | ${false}
        ${'yellow'}  | ${true}      | ${false}
    `('isSuggestedWord "$word" ignore case $ignoreCase', async ({ word, ignoreCase, expected }) => {
        expect(dict.isSuggestedWord(word, ignoreCase)).toEqual(expected);
    });

    test.each`
        word        | expected
        ${'purple'} | ${'purple'}
    `('mapWord "$word"', async ({ word, expected }) => {
        expect(dict.mapWord(word)).toEqual(expected);
    });
});
