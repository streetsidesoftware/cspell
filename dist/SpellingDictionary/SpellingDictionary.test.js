"use strict";
const chai_1 = require("chai");
const SpellingDictionary_1 = require("./SpellingDictionary");
const Rx = require("rxjs/Rx");
// cSpell:ignore aple
describe('Verify building Dictionary', () => {
    it('build', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];
        return SpellingDictionary_1.createSpellingDictionaryRx(Rx.Observable.from(words))
            .then(dict => {
            chai_1.expect(dict).to.be.instanceof(SpellingDictionary_1.SpellingDictionaryInstance);
            if (dict instanceof SpellingDictionary_1.SpellingDictionaryInstance) {
                chai_1.expect(dict.words).to.be.instanceof(Set);
                chai_1.expect(dict.trie.c).to.be.instanceof(Map);
            }
            chai_1.expect(dict.has('apple')).to.be.true;
            const suggestions = dict.suggest('aple').map(({ word }) => word);
            chai_1.expect(suggestions).to.contain('apple');
            chai_1.expect(suggestions).to.contain('ape');
            chai_1.expect(suggestions).to.not.contain('banana');
        });
    });
    it('build', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];
        const dict = SpellingDictionary_1.createSpellingDictionary(words);
        chai_1.expect(dict).to.be.instanceof(SpellingDictionary_1.SpellingDictionaryInstance);
        if (dict instanceof SpellingDictionary_1.SpellingDictionaryInstance) {
            chai_1.expect(dict.words).to.be.instanceof(Set);
            chai_1.expect(dict.trie.c).to.be.instanceof(Map);
        }
        chai_1.expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({ word }) => word);
        chai_1.expect(suggestions).to.contain('apple');
        chai_1.expect(suggestions).to.contain('ape');
        chai_1.expect(suggestions).to.not.contain('banana');
    });
});
//# sourceMappingURL=SpellingDictionary.test.js.map