import { createSpellingDictionary, SpellingDictionaryFromTrie } from './SpellingDictionary';
import { Trie } from 'cspell-trie-lib';

// cSpell:ignore aple

describe('Verify building Dictionary', () => {
    test('build from word list', async () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test');
        expect(dict.name).toBe('words');
        expect(dict).toBeInstanceOf(SpellingDictionaryFromTrie);
        if (dict instanceof SpellingDictionaryFromTrie) {
            expect(dict.trie.root.c).toBeInstanceOf(Map);
        }
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({word}) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('Test compounds from word list', async () => {
        const words = [
            'apple', 'apples', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
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
        const words = [
            'apple', 'Seattle', 'Amsterdam', 'surf', 'words', 'English', 'McGreyer',
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test', { caseSensitive: true });
        const ignoreCase = { ignoreCase: true };
        expect(dict.has('apple')).toBe(true);
        expect(dict.has('Apple', ignoreCase)).toBe(true);
        expect(dict.has('Apple')).toBe(true);
        expect(dict.has('APPLE')).toBe(true);
        expect(dict.has('Seattle')).toBe(true);
        expect(dict.has('seattle')).toBe(false);
        expect(dict.has('English')).toBe(true);
        expect(dict.has('english')).toBe(false);
        expect(dict.has('ENGLISH')).toBe(true);
        expect(dict.has('McGreyer')).toBe(true);
        expect(dict.has('mcgreyer')).toBe(false); // cspell:disable-line
        // We do not support mixed case as all caps matching at this point.
        expect(dict.has('MCGREYER')).toBe(false); // cspell:disable-line
        expect(dict.has('MCGREYER', ignoreCase)).toBe(true); // cspell:disable-line
    });

    test('Test Suggest Trie', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear',
            'cattle', 'rattle', 'battle',
            'rattles', 'battles', 'tattles',
        ];
        const trie = Trie.create(words);
        const dict = new SpellingDictionaryFromTrie(trie, 'trie');
        // cspell:ignore cattles
        const suggestions = dict.suggest('Cattles').map(({word}) => word);
        expect(suggestions[0]).toBe('cattle');
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });

    test('build from list containing non-strings', async () => {
        const words = [
            'apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words as string[], 'words', 'test');
        expect(dict.name).toBe('words');
        expect(dict).toBeInstanceOf(SpellingDictionaryFromTrie);
        expect(dict.has('apple')).toBe(true);
        const suggestions = dict.suggest('aple').map(({word}) => word);
        expect(suggestions).toEqual(expect.arrayContaining(['apple']));
        expect(suggestions).toEqual(expect.arrayContaining(['ape']));
        expect(suggestions).toEqual(expect.not.arrayContaining(['banana']));
    });
});

