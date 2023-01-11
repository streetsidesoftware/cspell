import * as Trie from 'cspell-trie-lib';

import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { createFlagWordsDictionary } from './FlagWordsDictionary';
import { createIgnoreWordsDictionary } from './IgnoreWordsDictionary';
import { CompoundWordsMethod } from './SpellingDictionary';
import { createCollection } from './SpellingDictionaryCollection';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import type { SpellingDictionaryOptions } from '.';

describe('Verify using multiple dictionaries', () => {
    const wordsA = [
        '',
        'apple',
        'banana',
        'orange',
        'pear',
        'pineapple',
        'mango',
        'avocado',
        'grape',
        'guava',
        'strawberry',
        'blueberry',
        'blackberry',
    ];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    const wordsD = ['red*', 'green*', 'blue*', 'pink*', 'black*', '*berry', '+-fruit', '*bug', 'pinkie'];
    const wordsF = ['!pink*', '+berry', '+bug', '!stinkbug'];
    const wordsG = ['café', 'accent'];

    const wordsLegacy = ['error', 'code', 'system', 'ctrl'];
    const wordsIgnore = ['ignored'];

    // cspell:ignore pinkberry behaviour colour
    const wordsNoSug = ['colour', 'behaviour', 'favour', 'pinkberry'];

    const dictNoSug = createSpellingDictionary(wordsNoSug, 'words-no-suggest', 'test', opts({ noSuggest: true }));
    const dictLegacy = createSpellingDictionary(wordsLegacy, 'legacy-dict', 'test', opts({ useCompounds: true }));
    const dictIgnore = createIgnoreWordsDictionary(wordsIgnore, '[ignore]', 'test');

    test.each`
        word            | expected
        ${'mango'}      | ${true}
        ${'tree'}       | ${false}
        ${'avocado'}    | ${true}
        ${'Avocado'}    | ${false}
        ${''}           | ${false}
        ${'red-fruit'}  | ${true}
        ${'-fruit'}     | ${false}
        ${'blackberry'} | ${true}
        ${'guava'}      | ${false}
        ${'Guava'}      | ${false}
    `('checks for existence of "$word"', async ({ word, expected }) => {
        const dicts = await Promise.all([
            createSpellingDictionary(wordsA, 'wordsA', 'test', opts()),
            createSpellingDictionary(wordsB, 'wordsB', 'test', opts()),
            createSpellingDictionary(wordsC, 'wordsC', 'test', opts()),
            createSpellingDictionary(wordsD, 'wordsD', 'test', opts()),
            createFlagWordsDictionary(['Avocado', 'guava'], 'flag_words', 'test'),
        ]);

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.size).toBeGreaterThanOrEqual(wordsA.length - 1 + wordsB.length + wordsC.length);
        expect(dictCollection.has(word)).toEqual(expected);
    });

    test.each`
        word           | expected
        ${'colour'}    | ${true}
        ${'Colour'}    | ${true}
        ${'tree'}      | ${false}
        ${''}          | ${false}
        ${'ignored'}   | ${true}
        ${'Ignored'}   | ${true}
        ${'behaviour'} | ${true}
        ${'guava'}     | ${false}
    `('isNoSuggestWord "$word"', async ({ word, expected }) => {
        const dicts = await Promise.all([
            createSpellingDictionary(wordsA, 'wordsA', 'test', opts()),
            createFlagWordsDictionary(['behaviour', 'guava', 'Ignored', 'Colour'], 'flag_words', 'test'),
            dictNoSug,
            dictIgnore,
        ]);

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.isNoSuggestWord(word, {})).toEqual(expected);
    });

    test('has for forbidden word.', () => {
        const word = 'guava';
        const expected = false;
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test', opts()),
            createSpellingDictionary(wordsB, 'wordsB', 'test', opts()),
            createSpellingDictionary(wordsC, 'wordsC', 'test', opts()),
            createSpellingDictionary(wordsD, 'wordsD', 'test', opts()),
            createFlagWordsDictionary(['Avocado', 'guava'], 'flag_words', 'test'),
        ];

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.size).toBeGreaterThanOrEqual(wordsA.length - 1 + wordsB.length + wordsC.length);
        expect(dictCollection.has(word)).toEqual(expected);
    });

    test('find forbidden word.', () => {
        const word = 'guava';
        const expected = false;
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test', opts()),
            createSpellingDictionary(wordsB, 'wordsB', 'test', opts()),
            createSpellingDictionary(wordsC, 'wordsC', 'test', opts()),
            createSpellingDictionary(wordsD, 'wordsD', 'test', opts()),
            createFlagWordsDictionary(['Avocado', 'guava'], 'flag_words', 'test'),
        ];

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.size).toBeGreaterThanOrEqual(wordsA.length - 1 + wordsB.length + wordsC.length);
        expect(dictCollection.has(word)).toEqual(expected);
    });

    test('checks mapWord is identity', async () => {
        const dicts = await Promise.all([createSpellingDictionary(wordsA, 'wordsA', 'test', opts())]);

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.mapWord('Hello')).toBe('Hello');
    });

    test('checks for suggestions', async () => {
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA', opts());
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test', opts()),
            createSpellingDictionary(wordsA, 'wordsA', 'test', opts()),
            createSpellingDictionary(wordsC, 'wordsC', 'test', opts()),
            createFailedToLoadDictionary('failed dict', './missing.txt', new Error('error')),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
        ]);

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.getErrors?.()).toHaveLength(1);
        const sugsForTango = dictCollection.suggest('tango', 10);
        expect(sugsForTango).toHaveLength(1);
        expect(sugsForTango[0].word).toEqual('mango');
        // make sure there is only one mango suggestion.
        expect(sugsForTango.map((a) => a.word).filter((a) => a === 'mango')).toEqual(['mango']);
    });

    test('checks for compound suggestions', async () => {
        // Add "wordsA" twice, once as a compound dictionary and once as a normal dictionary.
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA', opts());
        trie.options.useCompounds = true;
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
        ]);

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test');
        const sugResult = dictCollection.suggest('appletango', 10, CompoundWordsMethod.SEPARATE_WORDS);
        const sugs = sugResult.map((a) => a.word);
        expect(sugs).not.toContain('apple+mango');
        expect(sugs).toContain('apple mango');
    });

    test('checks for compound NONE suggestions', async () => {
        // Add "wordsA" twice, once as a compound dictionary and once as a normal dictionary.
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA', opts());
        trie.options.useCompounds = true;
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
        ]);

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test');
        const sugResult = dictCollection.suggest('applemango', 10, CompoundWordsMethod.NONE);
        const sugs = sugResult.map((a) => a.word);
        expect(sugs).not.toContain('apple+mango');
        expect(sugs).not.toContain('apple mango');
        expect(sugs).toContain('apple');
        expect(sugs).toContain('mango');
    });

    test('checks for compound JOIN_WORDS suggestions', async () => {
        // Add "wordsA" twice, once as a compound dictionary and once as a normal dictionary.
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA', opts());
        trie.options.useCompounds = true;
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
        ]);

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test');
        const sugResult = dictCollection.suggest('applemango', 10, CompoundWordsMethod.JOIN_WORDS);
        const sugs = sugResult.map((a) => a.word);
        expect(sugs).toContain('apple+mango');
        expect(sugs).not.toContain('apple mango');
        // possible word combinations
        expect(sugs).toContain('apple');
        expect(sugs).toContain('apple+apple');
        expect(sugs).toContain('grape+mango');
    });

    test('checks for compound suggestions with numbChanges', async () => {
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA', opts());
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
        ]);

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test');
        const sugResult = dictCollection.suggest('appletango', 10, CompoundWordsMethod.SEPARATE_WORDS, 2);
        const sugs = sugResult.map((a) => a.word);
        expect(sugs).toHaveLength(1);
        expect(sugs).not.toContain('apple+mango');
        expect(sugs).toContain('apple mango');
    });

    test.each`
        word              | expected
        ${'redberry'}     | ${true}
        ${'pink'}         | ${false}
        ${'bug'}          | ${true}
        ${'blackberry'}   | ${true}
        ${'pinkbug'}      | ${true}
        ${'cafe'}         | ${false}
        ${'café'}         | ${true}
        ${'cafe\u0301'}   | ${true}
        ${'accent'}       | ${true}
        ${'áccent'}       | ${true /* ignore the accent. cspell:disable-line */}
        ${'a\u0301ccent'} | ${true /* ignore the accent. cspell:disable-line */}
        ${'applé'}        | ${true /* ignore the accent. cspell:disable-line */}
        ${'ignored'}      | ${true}
    `('checks has word: "$word"', ({ word, expected }) => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test', { dictionaryInformation: { ignore: '\u0300-\u0362' } }),
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createSpellingDictionary(wordsD, 'wordsD', 'test', undefined),
            createSpellingDictionary(wordsF, 'wordsF', 'test', undefined),
            createSpellingDictionary(wordsG, 'wordsA', 'test', {
                dictionaryInformation: { ignore: '\u0300-\u0362' },
                caseSensitive: true,
            }),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
            dictIgnore,
        ];

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.has(word, { ignoreCase: false })).toEqual(expected);
    });

    test.each`
        word            | expected
        ${'redberry'}   | ${{ found: 'redberry', forbidden: false, noSuggest: false }}
        ${'pinkberry'}  | ${{ found: 'pinkberry', forbidden: false, noSuggest: true }}
        ${'pink'}       | ${{ found: 'pink', forbidden: true, noSuggest: false }}
        ${'bug'}        | ${{ found: 'bug', forbidden: false, noSuggest: false }}
        ${'blackberry'} | ${{ found: 'blackberry', forbidden: false, noSuggest: false }}
        ${'pinkbug'}    | ${{ found: 'pinkbug', forbidden: false, noSuggest: false }}
        ${'colour'}     | ${{ found: 'colour', forbidden: false, noSuggest: true }}
        ${'behaviour'}  | ${{ found: 'behaviour', forbidden: false, noSuggest: true }}
        ${'ignored'}    | ${{ found: 'ignored', forbidden: false, noSuggest: true }}
    `('find: "$word"', ({ word, expected }) => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createSpellingDictionary(wordsD, 'wordsD', 'test', undefined),
            createSpellingDictionary(wordsF, 'wordsF', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
            dictNoSug,
            dictIgnore,
        ];

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.find(word)).toEqual(expected);
    });

    // cspell:ignore error* *code ctrl* *code *berry*
    test.each`
        word            | expected
        ${'redberry'}   | ${{ found: 'redberry', forbidden: false, noSuggest: false }}
        ${'pinkberry'}  | ${{ found: 'pinkberry', forbidden: false, noSuggest: true }}
        ${'berryberry'} | ${{ found: 'berry+berry', forbidden: false, noSuggest: false }}
        ${'errorcode'}  | ${{ found: 'error+code', forbidden: false, noSuggest: false }}
        ${'ctrlcode'}   | ${{ found: 'ctrl+code', forbidden: false, noSuggest: false }}
        ${'pink'}       | ${{ found: 'pink', forbidden: true, noSuggest: false }}
        ${'bug'}        | ${{ found: 'bug', forbidden: false, noSuggest: false }}
        ${'blackberry'} | ${{ found: 'blackberry', forbidden: false, noSuggest: false }}
        ${'pinkbug'}    | ${{ found: 'pinkbug', forbidden: false, noSuggest: false }}
        ${'colour'}     | ${{ found: 'colour', forbidden: false, noSuggest: true }}
        ${'behaviour'}  | ${{ found: 'behaviour', forbidden: false, noSuggest: true }}
    `('find compound: "$word"', ({ word, expected }) => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createSpellingDictionary(wordsD, 'wordsD', 'test', undefined),
            createSpellingDictionary(wordsF, 'wordsF', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
            dictNoSug,
            dictLegacy,
            dictIgnore,
        ];

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.find(word, { useCompounds: true })).toEqual(expected);
    });

    // cspell:ignore pinkbug redberry
    // Note: `pinkbug` is not forbidden because compound forbidden words is not yet supported.
    test.each`
        word            | expected
        ${'redberry'}   | ${false}
        ${'pink'}       | ${true}
        ${'bug'}        | ${false}
        ${'blackberry'} | ${false}
        ${'stinkbug'}   | ${true}
        ${'pinkbug'}    | ${false}
    `('checks forbid word: "$word"', ({ word, expected }) => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createSpellingDictionary(wordsD, 'wordsD', 'test', undefined),
            createSpellingDictionary(wordsF, 'wordsF', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
        ];

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.isForbidden(word)).toEqual(expected);
    });

    function sr(word: string, cost: number) {
        return { word, cost };
    }

    test.each`
        word            | expected
        ${'redberry'}   | ${[sr('redberry', 0), sr('red berry', 105)]}
        ${'pink'}       | ${[sr('pinkie', 189)]}
        ${'bug'}        | ${[sr('bug', 5)]}
        ${'blackberry'} | ${[sr('blackberry', 0), sr('black berry', 98)]}
        ${'stinkbug'}   | ${[sr('stink bug', 103), sr('pinkbug', 198)]}
        ${'ignored'}    | ${[]}
    `('checks suggestions word: "$word"', ({ word, expected }) => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createSpellingDictionary(wordsD, 'wordsD', 'test', undefined),
            createSpellingDictionary(wordsF, 'wordsF', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
            dictIgnore,
        ];

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.suggest(word, 2)).toEqual(expected);
    });

    test('checks for suggestions with flagged words', async () => {
        const dicts = await Promise.all([
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
            createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
        ]);

        const dictCollection = createCollection(dicts, 'test');
        const sugs = dictCollection.suggest('avocado', 10);
        expect(sugs.map((r) => r.word)).not.toContain('Avocado');
    });

    test('checks for suggestions from mixed sources', async () => {
        const dicts = await Promise.all([
            createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
            createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
            createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
        ]);

        const dictCollection = createCollection(dicts, 'test');
        expect(dictCollection.has('mango')).toBe(true);
        expect(dictCollection.has('lion')).toBe(true);
        expect(dictCollection.has('ant')).toBe(true);

        const sugsForTango = dictCollection.suggest('tango', 10);
        expect(sugsForTango).toHaveLength(1);
        expect(sugsForTango[0].word).toBe('mango');
        // make sure there is only one mango suggestion.
        expect(sugsForTango.map((a) => a.word).filter((a) => a === 'mango')).toEqual(['mango']);

        // cspell:ignore cellipede
        const sugsForCellipede = dictCollection.suggest('cellipede', 5);
        expect(sugsForCellipede).toHaveLength(2);
        expect(sugsForCellipede.map((s) => s.word)).toContain('centipede');
        expect(sugsForCellipede.map((s) => s.word)).toContain('millipede');
    });
});

describe('Validate looking up words', () => {
    const wordsA = [
        '',
        'apple',
        'banana',
        'orange',
        'pear',
        'pineapple',
        'mango',
        'avocado',
        'grape',
        'strawberry',
        'blueberry',
        'blackberry',
    ];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    const wordsD = ['red*', 'green*', 'blue*', 'pink*', 'black*', '*berry', '+-fruit'];
    const cities = ['Seattle', 'Berlin', 'Amsterdam', 'Rome', 'London', 'Mumbai', 'Tokyo'];

    const testDicts = [
        createSpellingDictionary(wordsA, 'wordsA', 'test', undefined),
        createSpellingDictionary(wordsB, 'wordsB', 'test', undefined),
        createSpellingDictionary(wordsC, 'wordsC', 'test', undefined),
        createSpellingDictionary(wordsD, 'wordsD', 'test', undefined),
        createSpellingDictionary(cities, 'cities', 'test', undefined),
        createFlagWordsDictionary(['Avocado'], 'flag_words', 'test'),
    ];

    const testDictCollection = createCollection(testDicts, 'test');

    interface HasWordTest {
        word: string;
        found: boolean;
    }

    test.each`
        word             | found
        ${'Amsterdam'}   | ${true}
        ${'amsterdam'}   | ${true}
        ${'Black'}       | ${true}
        ${'black-fruit'} | ${true}
    `('Has word "$word" $found', ({ word, found }: HasWordTest) => {
        expect(testDictCollection.has(word)).toBe(found);
    });
});

function opts(opts: Partial<SpellingDictionaryOptions> = {}): SpellingDictionaryOptions {
    return {
        weightMap: undefined,
        ...opts,
    };
}
