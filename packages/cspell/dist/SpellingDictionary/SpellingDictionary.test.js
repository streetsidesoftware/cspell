"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const SpellingDictionary_1 = require("./SpellingDictionary");
const rxjs_1 = require("rxjs");
const cspell_trie_1 = require("cspell-trie");
// cSpell:ignore aple
describe('Verify building Dictionary', () => {
    it('build from rx list', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];
        return SpellingDictionary_1.createSpellingDictionaryRx(rxjs_1.from(words), 'test', 'test')
            .then(dict => {
            chai_1.expect(dict).to.be.instanceof(SpellingDictionary_1.SpellingDictionaryFromSet);
            if (dict instanceof SpellingDictionary_1.SpellingDictionaryFromSet) {
                chai_1.expect(dict.words).to.be.instanceof(Set);
                chai_1.expect(dict.trie.root.c).to.be.instanceof(Map);
            }
            chai_1.expect(dict.has('apple')).to.be.true;
            const suggestions = dict.suggest('aple').map(({ word }) => word);
            chai_1.expect(suggestions).to.contain('apple');
            chai_1.expect(suggestions).to.contain('ape');
            chai_1.expect(suggestions).to.not.contain('banana');
        });
    });
    it('build from word list', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];
        const dict = SpellingDictionary_1.createSpellingDictionary(words, 'words', 'test');
        chai_1.expect(dict.name).to.be.equal('words');
        chai_1.expect(dict).to.be.instanceof(SpellingDictionary_1.SpellingDictionaryFromSet);
        if (dict instanceof SpellingDictionary_1.SpellingDictionaryFromSet) {
            chai_1.expect(dict.words).to.be.instanceof(Set);
            chai_1.expect(dict.trie.root.c).to.be.instanceof(Map);
        }
        chai_1.expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        chai_1.expect(suggestions).to.contain('apple');
        chai_1.expect(suggestions).to.contain('ape');
        chai_1.expect(suggestions).to.not.contain('banana');
    });
    it('Test compounds from word list', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];
        const dict = SpellingDictionary_1.createSpellingDictionary(words, 'words', 'test', { useCompounds: true });
        chai_1.expect(dict.has('apple')).to.be.true;
        // cspell:ignore applebanana applebananas applebananaorange
        chai_1.expect(dict.has('applebanana')).to.be.true;
        chai_1.expect(dict.has('applebananaorange')).to.be.true;
        chai_1.expect(dict.has('applebananas')).to.be.false;
    });
    it('Test Suggest Trie', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear',
            'cattle', 'rattle', 'battle',
            'rattles', 'battles', 'tattles',
        ];
        const trie = cspell_trie_1.Trie.create(words);
        const dict = new SpellingDictionary_1.SpellingDictionaryFromTrie(trie, 'trie');
        // cspell:ignore cattles
        const suggestions = dict.suggest('Cattles').map(({ word }) => word);
        chai_1.expect(suggestions[0]).to.be.equal('cattle');
        chai_1.expect(suggestions).to.not.contain('banana');
    });
    it('build from rx list containing non-strings', () => {
        const words = [
            'apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'
        ];
        return SpellingDictionary_1.createSpellingDictionaryRx(rxjs_1.from(words), 'test', 'test')
            .then(dict => {
            chai_1.expect(dict).to.be.instanceof(SpellingDictionary_1.SpellingDictionaryFromSet);
            if (dict instanceof SpellingDictionary_1.SpellingDictionaryFromSet) {
                chai_1.expect(dict.words).to.be.instanceof(Set);
                chai_1.expect(dict.trie.root.c).to.be.instanceof(Map);
            }
            chai_1.expect(dict.has('apple')).to.be.true;
            const suggestions = dict.suggest('aple').map(({ word }) => word);
            chai_1.expect(suggestions).to.contain('apple');
            chai_1.expect(suggestions).to.contain('ape');
            chai_1.expect(suggestions).to.not.contain('banana');
        });
    });
    it('build from list containing non-strings', () => {
        const words = [
            'apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'
        ];
        const dict = SpellingDictionary_1.createSpellingDictionary(words, 'words', 'test');
        chai_1.expect(dict.name).to.be.equal('words');
        chai_1.expect(dict).to.be.instanceof(SpellingDictionary_1.SpellingDictionaryFromSet);
        if (dict instanceof SpellingDictionary_1.SpellingDictionaryFromSet) {
            chai_1.expect(dict.words).to.be.instanceof(Set);
            chai_1.expect(dict.trie.root.c).to.be.instanceof(Map);
        }
        chai_1.expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        chai_1.expect(suggestions).to.contain('apple');
        chai_1.expect(suggestions).to.contain('ape');
        chai_1.expect(suggestions).to.not.contain('banana');
    });
});
//# sourceMappingURL=SpellingDictionary.test.js.map