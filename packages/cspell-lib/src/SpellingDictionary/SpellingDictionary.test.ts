import { __testMethods } from './SpellingDictionaryMethods';
import { createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { Trie } from 'cspell-trie-lib';
import { FunctionArgs } from '../util/types';

// cSpell:ignore aple

describe('Verify building Dictionary', () => {
    test('build from word list', async () => {
        const words = ['apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'];

        const dict = await createSpellingDictionary(words, 'words', 'test');
        expect(dict.name).toBe('words');
        // expect(dict).toBeInstanceOf(SpellingDictionaryFromTrie);
        if (dict instanceof SpellingDictionaryFromTrie) {
            expect(dict.trie.root.c).toBeInstanceOf(Map);
        }
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('Test compounds from word list', async () => {
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

        const dict = await createSpellingDictionary(words, 'words', 'test', { useCompounds: true });
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

    test('Test case-sensitive word list', async () => {
        const words = ['apple', 'Seattle', 'Amsterdam', 'surf', 'words', 'English', 'McGreyer'];

        const dict = await createSpellingDictionary(words, 'words', 'test', {
            caseSensitive: true,
        });
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

    test('Test Suggest Trie', () => {
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
        const dict = new SpellingDictionaryFromTrie(trie, 'trie');
        // cspell:ignore cattles
        const suggestions = dict.suggest('Cattles').map(({ word }) => word);
        expect(suggestions[0]).toBe('cattle');
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('build from list containing non-strings', async () => {
        // eslint-disable-next-line no-sparse-arrays
        const words = ['apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'];

        const dict = await createSpellingDictionary(words as string[], 'words', 'test');
        expect(dict.name).toBe('words');
        // expect(dict).toBeInstanceOf(SpellingDictionaryFromTrie);
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('Test wordDictionaryFormsCollector', () => {
        function test(word: string, isCaseSensitive: boolean, expected: string[]) {
            const collector = __testMethods.wordDictionaryFormsCollector(isCaseSensitive);
            expect([...collector(word)].sort()).toEqual(expected.sort());
            expect([...collector(word)]).toEqual([]);
        }
        type Test = [string, boolean, string[]];
        // cspell:ignore café
        const tests: Test[] = [
            ['house', false, ['house']],
            ['House', false, ['House', 'house']],
            ['café', false, ['cafe', 'café']],
            ['Café', false, ['Cafe', 'Café', 'cafe', 'café']],
            ['House', true, ['House', '>house']],
            ['HOUSE', true, ['HOUSE', '>house']],
            ['Café', true, ['Café', '>Cafe', '>cafe', '>café']],
            // Make sure all accent forms work.
            ['café'.normalize(), false, ['cafe', 'café']],
            ['café'.normalize('NFD'), false, ['cafe', 'café']],
            ['café'.normalize('NFKC'), false, ['cafe', 'café']],
            ['café'.normalize('NFKD'), false, ['cafe', 'café']],
        ];
        tests.forEach((t) => test(...t));
    });
});

describe('Validate wordSearchForms', () => {
    function testCase(word: string, isCaseSensitive: boolean, ignoreCase: boolean, expected: string[]) {
        test(`${word} ${isCaseSensitive} ${ignoreCase} ${expected}`, () => {
            const words = __testMethods.wordSearchForms(word, isCaseSensitive, ignoreCase);
            expect(words.sort()).toEqual(expected.sort());
        });
    }
    type TestCase = FunctionArgs<typeof testCase>;
    // cspell:ignore café
    const tests: TestCase[] = [
        // word, dic is case sensitive, ignoreCase on lookup, expected
        ['house', false, false, ['house']],
        ['House', false, false, ['house']],
        ['House', false, false, ['house']],
        ['House', true, false, ['House', 'house']],
        ['HOUSE', false, false, ['house']],
        ['HOUSE', true, false, ['HOUSE', 'House', 'house']],
        ['café', false, false, ['café']],
        ['café', true, false, ['café']],
        ['café', true, true, ['cafe']],
        ['Café', false, false, ['café']],
        ['Café', false, true, ['cafe', 'café']],
        ['Café', true, false, ['Café', 'café']],
        ['Café', true, true, ['cafe']],
        ['CAFÉ', false, false, ['café']],
        ['CAFÉ', false, true, ['cafe', 'café']],
        ['CAFÉ', true, false, ['CAFÉ', 'Café', 'café']],
        ['CAFÉ', true, true, ['cafe']],
        // Make sure all accent forms work.
        ['café'.normalize(), false, false, ['café']],
        ['café'.normalize('NFD'), false, false, ['café']],
        ['café'.normalize('NFKC'), false, false, ['café']],
        ['café'.normalize('NFKD'), false, false, ['café']],
    ];
    tests.forEach((t) => testCase(...t));
});

describe('Verify Case Sensitive Dictionaries', () => {
    function testHas(word: string, ignoreCase: boolean | undefined, expected: boolean) {
        test(`Has ${word} Case: ${ignoreCase} Exp: ${expected}`, async () => {
            const dict = await sampleDict();
            expect(dict.has(word, { ignoreCase })).toBe(expected);
        });
    }

    const tests: FunctionArgs<typeof testHas>[] = [
        ['Paris', undefined, true],
        ['PARIS', undefined, true],
        ['paris', undefined, true],
        ['Paris', true, true],
        ['PARIS', true, true],
        ['paris', true, true],
        ['Paris', false, true],
        ['PARIS', false, true],
        ['paris', false, false],
        ['Köln', false, true],
        ['köln', false, false],
        ['KÖLN', false, true],
    ];
    tests.forEach((t) => testHas(...t));

    test('Suggestions 1', async () => {
        // cspell:ignore koln
        const dict = await sampleDict();
        const sugs = dict.suggest('kuln'); // cspell:disable-line
        const sugWords = sugs.map((s) => s.word);
        expect(sugWords).toEqual(['Köln']);
    });

    test('Suggestions 2', async () => {
        // cspell:ignore koln
        const dict = await sampleDict();
        const sugs = dict.suggest('kuln', { ignoreCase: false }); // cspell:disable-line
        const sugWords = sugs.map((s) => s.word);
        expect(sugWords).toEqual(['Köln']);
    });
});

function sampleDict() {
    const words = sampleWords();
    return createSpellingDictionary(words, 'words', 'test', { caseSensitive: true });
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
