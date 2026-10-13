import { buildITrieFromWords } from 'cspell-trie-lib';
import { describe, expect, test } from 'vitest';

import { createSpellingDictionary } from './createSpellingDictionary.js';
import type { SpellingDictionaryOptions } from './SpellingDictionary.js';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie.js';
import { wordSearchForms } from './SpellingDictionaryMethods.js';

// cSpell:ignore aple

describe('Verify building Dictionary', () => {
    test('build from word list', () => {
        const words = ['apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'];

        const dict = createSpellingDictionary(words, 'words', 'test', opts());
        expect(dict.name).toBe('words');
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('compounds from word list', () => {
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

        const dict = createSpellingDictionary(words, 'words', 'test', opts({ useCompounds: true }));
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

    test('case-sensitive word list', () => {
        const words = ['apple', 'Seattle', 'Amsterdam', 'surf', 'words', 'English', 'McGreyer'];

        const dict = createSpellingDictionary(
            words,
            'words',
            'test',
            opts({
                caseSensitive: true,
            }),
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
        const trie = buildITrieFromWords(words);
        const dict = new SpellingDictionaryFromTrie(trie, 'trie', opts());
        // cspell:ignore cattles
        const results = dict.suggest('Cattles');
        const suggestions = results.map(({ word }) => word);
        expect(suggestions).toEqual(['cattle', 'battles', 'rattles', 'tattles', 'battle', 'rattle']);
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('build from list containing non-strings', () => {
        // eslint-disable-next-line no-sparse-arrays
        const words = ['apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'];

        const dict = createSpellingDictionary(words as string[], 'words', 'test', opts());
        expect(dict.name).toBe('words');
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });
});

describe('Validate finding compound words.', () => {
    const words = [
        '*apple*',
        '*apples*',
        '*ape*',
        '*able*',
        '*apple*',
        '*banana*',
        '*orange*',
        '*pear*',
        '*aim*',
        '*approach*',
        '*bear*',
    ];

    test.each`
        word             | expected
        ${'applebanana'} | ${'apple|banana'}
    `('find $word in word list', ({ word, expected }) => {
        const dict = createSpellingDictionary(words, 'words', 'test', opts({}));
        const r = dict.find(word, { compoundSeparator: '|' });
        expect(r?.found).toBe(expected);
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
        ${'café'}                   | ${true}         | ${false}   | ${[]}
        ${'café'}                   | ${true}         | ${true}    | ${[]}
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
        const words = [...wordSearchForms(word, isCaseSensitive, ignoreCase)];
        expect(words.sort()).toEqual(expected.sort());
    });
});

// cspell:ignore inceleme İnceleme İNCELEME ispanak ıspanak Ispanakk ışık IŞIK irak ırak isim ISIM İSİM ısım
// cspell:ignore İnside ınside άνθρωπος Άνθρωπος ΆΝΘΡΩΠΟΣ İstanbul İSTANBUL
describe('Validate wordSearchForms with a locale', () => {
    test.each`
        word          | isCaseSensitive | ignoreCase | locale       | expected
        ${'Ispanak'}  | ${false}        | ${true}    | ${'tr-TR'}   | ${['ispanak']}
        ${'İnceleme'} | ${false}        | ${true}    | ${'tr-TR'}   | ${['inceleme', 'i̇nceleme']}
        ${'İnceleme'} | ${true}         | ${true}    | ${'tr-TR'}   | ${['inceleme', 'i̇nceleme']}
        ${'İnceleme'} | ${true}         | ${false}   | ${'tr-TR'}   | ${['İnceleme', 'inceleme']}
        ${'IRAK'}     | ${true}         | ${false}   | ${'tr-TR'}   | ${['IRAK', 'ırak', 'Irak']}
        ${'İSTANBUL'} | ${true}         | ${false}   | ${'tr-TR'}   | ${['İSTANBUL', 'istanbul', 'İstanbul']}
        ${'ISIM'}     | ${false}        | ${false}   | ${'tr-TR'}   | ${['isim']}
        ${'ΆΝΘΡΩΠΟΣ'} | ${true}         | ${false}   | ${'el-GR'}   | ${['ΆΝΘΡΩΠΟΣ', 'άνθρωπος', 'Άνθρωπος']}
        ${'HOUSE'}    | ${true}         | ${false}   | ${'en-US'}   | ${['HOUSE', 'House', 'house']}
        ${'HOUSE'}    | ${true}         | ${false}   | ${undefined} | ${['HOUSE', 'House', 'house']}
    `(
        '$word $isCaseSensitive $ignoreCase $locale $expected',
        ({ word, isCaseSensitive, ignoreCase, locale, expected }) => {
            const words = [...wordSearchForms(word, isCaseSensitive, ignoreCase, locale)];
            expect(words.sort()).toEqual(expected.sort());
        },
    );
});

describe('Verify dictionaries with a locale', () => {
    // Built with the default case rules, like the dictionaries in cspell-dicts.
    const trWords = ['inceleme', 'ıspanak', 'ışık', 'isim', 'İstanbul', 'Irak'];

    test.each`
        word          | ignoreCase | expected
        ${'inceleme'} | ${true}    | ${true}
        ${'İnceleme'} | ${true}    | ${true}
        ${'İNCELEME'} | ${true}    | ${true}
        ${'Ispanak'}  | ${true}    | ${true}
        ${'IŞIK'}     | ${true}    | ${true}
        ${'İSTANBUL'} | ${true}    | ${true}
        ${'IRAK'}     | ${true}    | ${true}
        ${'ISIM'}     | ${true}    | ${true}
        ${'Ispanakk'} | ${true}    | ${false}
        ${'İnceleme'} | ${false}   | ${true}
        ${'İNCELEME'} | ${false}   | ${true}
        ${'Ispanak'}  | ${false}   | ${true}
        ${'IŞIK'}     | ${false}   | ${true}
        ${'İSTANBUL'} | ${false}   | ${true}
        ${'IRAK'}     | ${false}   | ${true}
        ${'İSİM'}     | ${false}   | ${true}
        ${'ISIM'}     | ${false}   | ${false}
        ${'Inceleme'} | ${false}   | ${false}
    `('tr-TR has $word ignoreCase: $ignoreCase', ({ word, ignoreCase, expected }) => {
        const dict = createSpellingDictionary(trWords, 'tr-test', 'test', opts({ locale: 'tr-TR' }));
        expect(dict.has(word, { ignoreCase })).toBe(expected);
    });

    test.each`
        word          | ignoreCase | expected
        ${'İnceleme'} | ${true}    | ${false}
        ${'Ispanak'}  | ${true}    | ${false}
        ${'İSTANBUL'} | ${false}   | ${false}
    `('without a locale has $word ignoreCase: $ignoreCase', ({ word, ignoreCase, expected }) => {
        const dict = createSpellingDictionary(trWords, 'tr-test-no-locale', 'test', opts());
        expect(dict.has(word, { ignoreCase })).toBe(expected);
    });

    test.each`
        word        | ignoreCase | expected
        ${'Inside'} | ${true}    | ${true}
        ${'INSIDE'} | ${false}   | ${true}
        ${'İnside'} | ${true}    | ${false}
    `('en-US has $word ignoreCase: $ignoreCase', ({ word, ignoreCase, expected }) => {
        const dict = createSpellingDictionary(['inside'], 'en-test', 'test', opts({ locale: 'en-US' }));
        expect(dict.has(word, { ignoreCase })).toBe(expected);
    });

    test('el-GR keeps the accent on a capitalized word', () => {
        const dict = createSpellingDictionary(['Άνθρωπος'], 'el-test', 'test', opts({ locale: 'el-GR' }));
        expect(dict.has('ΆΝΘΡΩΠΟΣ', { ignoreCase: false })).toBe(true);
    });
});

describe('Validate JavaScript assumptions', () => {
    test('toLowerCase ignores the Turkish rules for I and İ', () => {
        expect('İ'.toLowerCase()).toBe('i̇');
        expect('I'.toLowerCase()).toBe('i');
    });

    test('toLocaleLowerCase applies the Turkish rules for I and İ', () => {
        expect('İ'.toLocaleLowerCase('tr-TR')).toBe('i');
        expect('I'.toLocaleLowerCase('tr-TR')).toBe('ı');
    });

    test('toLocaleUpperCase for Greek removes accents', () => {
        expect('ά'.toLocaleUpperCase('el-GR')).toBe('Α');
        expect('ά'.toUpperCase()).toBe('Ά');
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

describe('test ignoreForbiddenWordsOption', () => {
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
        '!apple',
        '!berry',
    ];

    test('forbidden words are not found', () => {
        const dict = createSpellingDictionary(words, 'words', 'test', opts({ ignoreForbiddenWords: true }));
        expect(dict.has('apple')).toBe(false);
        expect(dict.find('apple')).toBe(undefined);
        expect(dict.isForbidden('apple')).toBe(false);
        expect(dict.has('berry')).toBe(false);
        expect(dict.find('berry')).toBe(undefined);
        expect(dict.isForbidden('berry')).toBe(false);
    });

    test('forbidden words are found', () => {
        const dict = createSpellingDictionary(words, 'words', 'test', opts({ ignoreForbiddenWords: false }));
        expect(dict.has('apple')).toBe(true);
        expect(dict.find('apple')).toEqual({ found: 'apple', forbidden: true, noSuggest: false });
        expect(dict.isForbidden('apple')).toBe(true);
        expect(dict.has('berry')).toBe(false);
        expect(dict.find('berry')).toEqual({ found: 'berry', forbidden: true, noSuggest: false });
        expect(dict.isForbidden('berry')).toBe(true);
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
