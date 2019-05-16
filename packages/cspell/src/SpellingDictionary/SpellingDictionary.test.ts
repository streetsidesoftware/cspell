import { expect } from 'chai';
import { createSpellingDictionary, SpellingDictionaryFromSet, SpellingDictionaryFromTrie } from './SpellingDictionary';
import { Trie } from 'cspell-trie';

// cSpell:ignore aple

describe('Verify building Dictionary', () => {
    it('build from word list', async () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test');
        expect(dict.name).to.be.equal('words');
        expect(dict).to.be.instanceof(SpellingDictionaryFromSet);
        if (dict instanceof SpellingDictionaryFromSet) {
            expect(dict.words).to.be.instanceof(Set);
            expect(dict.trie.root.c).to.be.instanceof(Map);
        }
        expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({word}) => word);
        expect(suggestions).to.contain('apple');
        expect(suggestions).to.contain('ape');
        expect(suggestions).to.not.contain('banana');
    });

    it('Test compounds from word list', async () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words, 'words', 'test', { useCompounds: true });
        expect(dict.has('apple')).to.be.true;
        // cspell:ignore applebanana applebananas applebananaorange
        expect(dict.has('applebanana')).to.be.true;
        expect(dict.has('applebananaorange')).to.be.true;
        expect(dict.has('applebananas')).to.be.false;
    });

    it('Test Suggest Trie', () => {
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

    it('build from list containing non-strings', async () => {
        const words = [
            'apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = await createSpellingDictionary(words as string[], 'words', 'test');
        expect(dict.name).to.be.equal('words');
        expect(dict).to.be.instanceof(SpellingDictionaryFromSet);
        if (dict instanceof SpellingDictionaryFromSet) {
            expect(dict.words).to.be.instanceof(Set);
            expect(dict.trie.root.c).to.be.instanceof(Map);
        }
        expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({word}) => word);
        expect(suggestions).to.contain('apple');
        expect(suggestions).to.contain('ape');
        expect(suggestions).to.not.contain('banana');
    });
});

