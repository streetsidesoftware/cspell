import { expect } from 'chai';
import { createSpellingDictionary, SpellingDictionaryFromTrie } from './SpellingDictionary';
import { Trie } from 'cspell-trie-lib';

// cSpell:ignore aple

describe('Verify building Dictionary', () => {
    test('build from word list', async () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test');
        expect(dict.name).to.be.equal('words');
        expect(dict).to.be.instanceof(SpellingDictionaryFromTrie);
        if (dict instanceof SpellingDictionaryFromTrie) {
            expect(dict.trie.root.c).to.be.instanceof(Map);
        }
        expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({word}) => word);
        expect(suggestions).to.contain('apple');
        expect(suggestions).to.contain('ape');
        expect(suggestions).to.not.contain('banana');
    });

    test('Test compounds from word list', async () => {
        const words = [
            'apple', 'apples', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test', { useCompounds: true });
        expect(dict.has('apple')).to.be.true;
        expect(dict.has('Apple')).to.be.true;
        expect(dict.has('APPLE')).to.be.true;
        expect(dict.has('APPLEs')).to.be.true;
        expect(dict.has('APPles')).to.be.true; // cspell:disable-line
        // cspell:ignore applebanana applebananas applebananaorange
        expect(dict.has('applebanana')).to.be.true;
        expect(dict.has('applebananaorange')).to.be.true;
        expect(dict.has('applebananas')).to.be.false;
    });

    test('Test case-sensitive word list', async () => {
        const words = [
            'apple', 'Seattle', 'Amsterdam', 'surf', 'words', 'English', 'McGreyer',
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test', { caseSensitive: true });
        const ignoreCase = { ignoreCase: true };
        expect(dict.has('apple')).to.be.true;
        expect(dict.has('Apple', ignoreCase)).to.be.true;
        expect(dict.has('Apple')).to.be.true;
        expect(dict.has('APPLE')).to.be.true;
        expect(dict.has('Seattle')).to.be.true;
        expect(dict.has('seattle')).to.be.false;
        expect(dict.has('English')).to.be.true;
        expect(dict.has('english')).to.be.false;
        expect(dict.has('ENGLISH')).to.be.true;
        expect(dict.has('McGreyer')).to.be.true;
        expect(dict.has('mcgreyer')).to.be.false; // cspell:disable-line
        // We do not support mixed case as all caps matching at this point.
        expect(dict.has('MCGREYER')).to.be.false; // cspell:disable-line
        expect(dict.has('MCGREYER', ignoreCase)).to.be.true; // cspell:disable-line
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
        expect(suggestions[0]).to.be.equal('cattle');
        expect(suggestions).to.not.contain('banana');
    });

    test('build from list containing non-strings', async () => {
        const words = [
            'apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words as string[], 'words', 'test');
        expect(dict.name).to.be.equal('words');
        expect(dict).to.be.instanceof(SpellingDictionaryFromTrie);
        expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({word}) => word);
        expect(suggestions).to.contain('apple');
        expect(suggestions).to.contain('ape');
        expect(suggestions).to.not.contain('banana');
    });
});

