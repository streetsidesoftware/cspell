import { Trie } from 'cspell-trie-lib';

import { createSpellingDictionary } from './createSpellingDictionary';
import type { SpellingDictionaryOptions } from './SpellingDictionary';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { __testMethods__ } from './SpellingDictionaryMethods';

// cSpell:ignore aple

describe('Verify building Dictionary', () => {
    test('build from word list', async () => {
        const words = ['apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'];

        const dict = await createSpellingDictionary(words, 'words', 'test', opts());
        expect(dict.name).toBe('words');
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('compounds from word list', async () => {
        const words = [
            'apple',
            'apples',
            'ape',
            'able',
            'apple',
            'banana',
            'orange',
            'pear',
            'aim',
            'approach',
            'bear',
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test', opts({ useCompounds: true }));
        expect(dict.has('apple')).toBe(true);
        expect(dict.has('Apple')).toBe(true);
        expect(dict.has('APPLE')).toBe(true);
        expect(dict.has('APPLEs')).toBe(true);
        expect(dict.has('APPles')).toBe(true); // cspell:disable-line
        // cspell:ignore applebanana applebananas applebananaorange
        expect(dict.has('applebanana')).toBe(true);
        expect(dict.has('applebananaorange')).toBe(true);
        expect(dict.has('applebananas')).toBe(false);
    });

    test('case-sensitive word list', async () => {
        const words = ['apple', 'Seattle', 'Amsterdam', 'surf', 'words', 'English', 'McGreyer'];

        const dict = await createSpellingDictionary(
            words,
            'words',
            'test',
            opts({
                caseSensitive: true,
            })
        );
        const ignoreCase = { ignoreCase: true };
        const useCase = { ignoreCase: false };
        expect(dict.has('apple', useCase)).toBe(true);
        expect(dict.has('Apple', ignoreCase)).toBe(true);
        expect(dict.has('Apple', useCase)).toBe(true);
        expect(dict.has('APPLE', useCase)).toBe(true);
        expect(dict.has('Seattle', useCase)).toBe(true);
        expect(dict.has('seattle', useCase)).toBe(false);
        expect(dict.has('English', useCase)).toBe(true);
        expect(dict.has('english', useCase)).toBe(false);
        expect(dict.has('ENGLISH', useCase)).toBe(true);
        expect(dict.has('McGreyer', useCase)).toBe(true);
        expect(dict.has('mcgreyer', useCase)).toBe(false); // cspell:disable-line
        // We do not support mixed case as all caps matching at this point.
        expect(dict.has('MCGREYER', useCase)).toBe(false); // cspell:disable-line
        expect(dict.has('MCGREYER', ignoreCase)).toBe(true); // cspell:disable-line
    });

    test('Suggest Trie', () => {
        const words = [
            'apple',
            'ape',
            'able',
            'apple',
            'banana',
            'orange',
            'pear',
            'aim',
            'approach',
            'bear',
            'cattle',
            'rattle',
            'battle',
            'rattles',
            'battles',
            'tattles',
        ];
        const trie = Trie.create(words);
        const dict = new SpellingDictionaryFromTrie(trie, 'trie', opts());
        // cspell:ignore cattles
        const results = dict.suggest('Cattles');
        const suggestions = results.map(({ word }) => word);
        expect(suggestions).toEqual(['cattle', 'battles', 'rattles', 'tattles', 'battle', 'rattle']);
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('build from list containing non-strings', async () => {
        // eslint-disable-next-line no-sparse-arrays
        const words = ['apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'];

        const dict = await createSpellingDictionary(words as string[], 'words', 'test', opts());
        expect(dict.name).toBe('words');
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });
});

describe('Validate wordSearchForms', () => {
    test.each`
        word                        | isCaseSensitive | ignoreCase | expected
        ${'house'}                  | ${false}        | ${false}   | ${['house']}
        ${'House'}                  | ${false}        | ${false}   | ${['house']}
        ${'House'}                  | ${false}        | ${false}   | ${['house']}
        ${'House'}                  | ${true}         | ${false}   | ${['House', 'house']}
        ${'HOUSE'}                  | ${false}        | ${false}   | ${['house']}
        ${'HOUSE'}                  | ${true}         | ${false}   | ${['HOUSE', 'House', 'house']}
        ${'café'}                   | ${false}        | ${false}   | ${['café']}
        ${'café'}                   | ${true}         | ${false}   | ${['café']}
        ${'café'}                   | ${true}         | ${true}    | ${['café']}
        ${'Café'}                   | ${false}        | ${false}   | ${['café']}
        ${'Café'}                   | ${false}        | ${true}    | ${['café']}
        ${'Café'}                   | ${true}         | ${false}   | ${['Café', 'café']}
        ${'Café'}                   | ${true}         | ${true}    | ${['café']}
        ${'CAFÉ'}                   | ${false}        | ${false}   | ${['café']}
        ${'CAFÉ'}                   | ${false}        | ${true}    | ${['café']}
        ${'CAFÉ'}                   | ${true}         | ${false}   | ${['CAFÉ', 'Café', 'café']}
        ${'CAFÉ'}                   | ${true}         | ${true}    | ${['café']}
        ${'café'.normalize()}       | ${false}        | ${false}   | ${['café']}
        ${'café'.normalize('NFD')}  | ${false}        | ${false}   | ${['café']}
        ${'café'.normalize('NFKC')} | ${false}        | ${false}   | ${['café']}
        ${'café'.normalize('NFKD')} | ${false}        | ${false}   | ${['café']}
    `('$word $isCaseSensitive $ignoreCase $expected', ({ word, isCaseSensitive, ignoreCase, expected }) => {
        const words = __testMethods__.wordSearchFormsArray(word, isCaseSensitive, ignoreCase);
        expect(words.sort()).toEqual(expected.sort());
    });
});

describe('Verify Case Sensitive Dictionaries', () => {
    test.each`
        word       | ignoreCase   | expected
        ${'Paris'} | ${undefined} | ${true}
        ${'PARIS'} | ${undefined} | ${true}
        ${'paris'} | ${undefined} | ${true}
        ${'Paris'} | ${true}      | ${true}
        ${'PARIS'} | ${true}      | ${true}
        ${'paris'} | ${true}      | ${true}
        ${'Paris'} | ${false}     | ${true}
        ${'PARIS'} | ${false}     | ${true}
        ${'paris'} | ${false}     | ${false}
        ${'Köln'}  | ${false}     | ${true}
        ${'köln'}  | ${false}     | ${false}
        ${'KÖLN'}  | ${false}     | ${true}
    `(`Has $word Case: $ignoreCase Exp: $expected`, ({ word, ignoreCase, expected }) => {
        const dict = sampleDict();
        expect(dict.has(word, { ignoreCase })).toBe(expected);
    });

    // cspell:ignore kuln
    test.each`
        word      | ignoreCase | expected
        ${'köln'} | ${false}   | ${['Köln']}
        ${'köln'} | ${true}    | ${['köln', 'koln', 'Köln']}
        ${'koln'} | ${true}    | ${['koln', 'köln', 'Köln']}
        ${'kuln'} | ${false}   | ${['Köln']}
        ${'kuln'} | ${true}    | ${['koln', 'köln', 'Köln']}
    `('Suggestions for $word $ignoreCase $expected', ({ word, ignoreCase, expected }) => {
        // cspell:ignore koln
        const dict = sampleDict();
        const sugs = dict.suggest(word, { ignoreCase });
        const sugWords = sugs.map((s) => s.word);
        expect(sugWords).toEqual(expected);
    });
});

function sampleDict() {
    const words = sampleWords();
    return createSpellingDictionary(words, 'words', 'test', opts({ caseSensitive: true }));
}

// cspell:words métro Rhône Köln Düsseldorf
function sampleWords() {
    return `
        England Canada Netherlands France German China Belgium
        Paris Chicago Amsterdam Antwerp Brussels Rhône Cologne Köln Düsseldorf
        métro cafe café metro
        apple apples ape apes around astound profound compound
        table tables tabled
    `.split(/\s+/g);
}

function opts(opts: Partial<SpellingDictionaryOptions> = {}): SpellingDictionaryOptions {
    return {
        weightMap: undefined,
        ...opts,
    };
}
