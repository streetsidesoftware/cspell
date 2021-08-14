import * as Trie from 'cspell-trie-lib';
import { SpellingDictionaryCollection, createCollectionP, createCollection } from './SpellingDictionaryCollection';
import { CompoundWordsMethod } from './SpellingDictionaryMethods';
import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';

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
        'strawberry',
        'blueberry',
        'blackberry',
    ];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    const wordsD = ['red*', 'green*', 'blue*', 'pink*', 'black*', '*berry', '+-fruit', '*bug', 'pinkie'];
    const wordsF = ['!pink*', '+berry', '+bug', '!stinkbug'];
    test('checks for existence', async () => {
        const dicts = await Promise.all([
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
            createSpellingDictionary(wordsD, 'wordsD', 'test'),
        ]);

        const dictCollection = new SpellingDictionaryCollection(dicts, 'test', ['Avocado']);
        expect(dictCollection.has('mango')).toBe(true);
        expect(dictCollection.has('tree')).toBe(false);
        expect(dictCollection.has('avocado')).toBe(false);
        expect(dictCollection.has('')).toBe(false);
        expect(dictCollection.has('red-fruit')).toBe(true);
        expect(dictCollection.has('-fruit')).toBe(false);
        expect(dictCollection.has('blackberry')).toBe(true);
        expect(dictCollection.size).toBeGreaterThanOrEqual(wordsA.length - 1 + wordsB.length + wordsC.length);
    });

    test('checks mapWord is identity', async () => {
        const dicts = await Promise.all([createSpellingDictionary(wordsA, 'wordsA', 'test')]);

        const dictCollection = new SpellingDictionaryCollection(dicts, 'test', []);
        expect(dictCollection.mapWord('Hello')).toBe('Hello');
    });

    test('checks for suggestions', async () => {
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
            createFailedToLoadDictionary(
                new SpellingDictionaryLoadError(
                    './missing.txt',
                    { name: 'error', path: './missing.txt' },
                    new Error('error'),
                    'failed to load'
                )
            ),
        ]);

        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        expect(dictCollection.getErrors?.()).toHaveLength(1);
        const sugsForTango = dictCollection.suggest('tango', 10);
        expect(sugsForTango).toHaveLength(1);
        expect(sugsForTango[0].word).toEqual('mango');
        // make sure there is only one mango suggestion.
        expect(sugsForTango.map((a) => a.word).filter((a) => a === 'mango')).toEqual(['mango']);
    });

    test('checks for compound suggestions', async () => {
        // Add "wordsA" twice, once as a compound dictionary and once as a normal dictionary.
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        trie.options.useCompounds = true;
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ]);

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        const sugResult = dictCollection.suggest('appletango', 10, CompoundWordsMethod.SEPARATE_WORDS);
        const sugs = sugResult.map((a) => a.word);
        expect(sugs).toHaveLength(10);
        expect(sugs).toContain('apple+mango');
        expect(sugs).toContain('apple mango');
    });

    test('checks for compound suggestions with numbChanges', async () => {
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        const dicts = await Promise.all([
            trie,
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ]);

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        const sugResult = dictCollection.suggest('appletango', 10, CompoundWordsMethod.SEPARATE_WORDS, 2);
        const sugs = sugResult.map((a) => a.word);
        expect(sugs).toHaveLength(1);
        expect(sugs).not.toContain('apple+mango');
        expect(sugs).toContain('apple mango');
    });

    test.each`
        word            | expected
        ${'redberry'}   | ${true}
        ${'pink'}       | ${true}
        ${'bug'}        | ${true}
        ${'blackberry'} | ${true}
        ${'pinkbug'}    | ${true}
    `('checks has word: "$word"', ({ word, expected }) => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
            createSpellingDictionary(wordsD, 'wordsD', 'test'),
            createSpellingDictionary(wordsF, 'wordsF', 'test'),
        ];

        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        expect(dictCollection.has(word)).toEqual(expected);
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
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
            createSpellingDictionary(wordsD, 'wordsD', 'test'),
            createSpellingDictionary(wordsF, 'wordsF', 'test'),
        ];

        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
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
    `('checks suggestions word: "$word"', ({ word, expected }) => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
            createSpellingDictionary(wordsD, 'wordsD', 'test'),
            createSpellingDictionary(wordsF, 'wordsF', 'test'),
        ];

        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        expect(dictCollection.suggest(word, 2)).toEqual(expected);
    });

    test('checks for suggestions with flagged words', async () => {
        const dicts = await Promise.all([
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ]);

        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        const sugs = dictCollection.suggest('avocado', 10);
        expect(sugs.map((r) => r.word)).not.toContain('avocado');
    });

    test('checks for suggestions from mixed sources', async () => {
        const dicts = await Promise.all([
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ]);

        const dictCollection = new SpellingDictionaryCollection(dicts, 'test', []);
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

    test('creates using createCollectionP', async () => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA', 'test'),
            createSpellingDictionary(wordsB, 'wordsB', 'test'),
            createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ];

        const dictCollection = await createCollectionP(dicts, 'test', []);
        expect(dictCollection.has('mango')).toBe(true);
        expect(dictCollection.has('tree')).toBe(false);
        const sugs = dictCollection.suggest('mangos', 4);
        const sugWords = sugs.map((s) => s.word);
        expect(sugWords[0]).toBe('mango');
        expect(dictCollection.getErrors?.()).toHaveLength(0);
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
        createSpellingDictionary(wordsA, 'wordsA', 'test'),
        createSpellingDictionary(wordsB, 'wordsB', 'test'),
        createSpellingDictionary(wordsC, 'wordsC', 'test'),
        createSpellingDictionary(wordsD, 'wordsD', 'test'),
        createSpellingDictionary(cities, 'cities', 'test'),
    ];

    const testDictCollection = new SpellingDictionaryCollection(testDicts, 'test', ['Avocado']);

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
