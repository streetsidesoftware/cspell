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
        // console.log(asString);
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
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'talk',
    'talks',
    'talked',
    'talker',
    'talking',
    'lift',
    'lifts',
    'lifted',
    'lifter',
    'lifting',
    'journal',
    'journals',
    'journalism',
    'journalist',
    'journalistic',
    'journey',
    'journeyer',
    'journeyman',
    'journeymen',
    'joust',
    'jouster',
    'jousting',
    'jovial',
    'joviality',
    'jowl',
    'jowly',
    'joy',
    'joyful',
    'joyfuller',
    'joyfullest',
    'joyfulness',
    'joyless',
    'joylessness',
    'joyous',
    'joyousness',
    'joyridden',
    'joyride',
    'joyrider',
    'joyriding',
    'joyrode',
    'joystick',
];


