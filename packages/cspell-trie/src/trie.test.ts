import {expect} from 'chai';
import * as Trie from '.';
import * as Rx from 'rxjs/Rx';

describe('Experiment with Tries', function() {
    it('Adds words to a Trie and takes them back out.', () => {
        const words = [sampleWords]
            // Sort them.
            .map(a => a.sort())
            // Make them unique
            .map(a => [...(new Set(a))])
            .reduce((a, b) => a.concat(b));
        const trie = words
            .reduce((t, w) => {
                return Trie.insert(w, t);
            }, {} as Trie.TrieNode);
        expect(trie.c).to.not.be.undefined;
        const extractedWords = [...Trie.iteratorTrieWords(trie)];
        expect(extractedWords).to.be.deep.equal(words);

    });

    it('Adds words to a Trie sorts the trie and takes them back out.', () => {
        const words = [sampleWords]
            // Sort them.
            .map(a => a.sort())
            // Make them unique
            .map(a => [...(new Set(a))])
            .reduce((a, b) => a.concat(b));
        const trie = words
            .reduce((t, w) => {
                return Trie.insert(w, t);
            }, {} as Trie.TrieNode);
        expect(trie.c).to.not.be.undefined;
        Trie.orderTrie(trie);
        const extractedWords = [...Trie.iteratorTrieWords(trie)];
        // console.log(extractedWords);
        expect(extractedWords).to.be.deep.equal(words.sort());
    });

    it('buildReferenceTree', () => {
        const words = [sampleWords]
            // Sort them.
            .map(a => a.sort())
            // Make them unique
            .map(a => [...(new Set(a))])
            .reduce((a, b) => a.concat(b));
        const trie = words
            .reduce((t, w) => {
                return Trie.insert(w, t);
            }, {} as Trie.TrieNode);
        const asString = [...Trie.exportTrie(trie, 10)].join('');
        return Trie.importTrieRx(Rx.Observable.from(asString.split('\n')))
            .toArray()
            .toPromise()
            .then(tries => {
                const trie = words
                    .reduce((t, w) => {
                        return Trie.insert(w, t);
                    }, {} as Trie.TrieNode);
                const trie2 = tries[0];
                const extractedWords1 = [...Trie.iteratorTrieWords(trie)];
                const extractedWords2 = [...Trie.iteratorTrieWords(trie2)];
                expect(extractedWords2.sort()).to.be.deep.equal(extractedWords1.sort());
            });
    });
});


const sampleWords = [
    'journal/MS',
    'journalese/M',
    'journalism/M',
    'journalist/SM',
    'journalistic',
    'journey/ZGMDRS',
    'journeyer/M',
    'journeyman/M',
    'journeymen',
    'journo/S',
    'joust/SZGMDR',
    'jouster/M',
    'jousting/M',
    'jovial/Y',
    'joviality/M',
    'jowl/MS',
    'jowly/TR',
    'joy/SGMD',
    'joyful/YP',
    'joyfuller',
    'joyfullest',
    'joyfulness/M',
    'joyless/PY',
    'joylessness/M',
    'joyous/YP',
    'joyousness/M',
    'joyridden',
    'joyride/RSMZG',
    'joyrider/M',
    'joyriding/M',
    'joyrode',
    'joystick/SM',
];


/*
cspell:ignore ZGMDRS SZGMDR SGMD RSMZG COMPOUNDMIN COMPOUNDRULE WORDCHARS ication ications ieth ings iest iers sxzh sxzhy iness ment aeiou
*/
