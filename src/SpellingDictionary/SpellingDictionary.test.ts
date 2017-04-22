import { expect } from 'chai';
import { createSpellingDictionaryRx, createSpellingDictionary, SpellingDictionaryFromSet } from './SpellingDictionary';
import * as Rx from 'rxjs/Rx';

// cSpell:ignore aple

describe('Verify building Dictionary', () => {
    it('build from rx list', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        return createSpellingDictionaryRx(Rx.Observable.from(words), 'test')
            .then(dict => {
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

    it('build from word list', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = createSpellingDictionary(words, 'words');
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

    it('build from rx list containing non-strings', () => {
        const words = [
            'apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'
        ];

        return createSpellingDictionaryRx(Rx.Observable.from(words), 'test')
            .then(dict => {
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

    it('build from list containing non-strings', () => {
        const words = [
            'apple', 'ape', 'able', , 'apple', 'banana', 'orange', 5, 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = createSpellingDictionary(words as string[], 'words');
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

