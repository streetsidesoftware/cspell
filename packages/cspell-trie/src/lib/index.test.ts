import {expect} from 'chai';
import * as Trie from '.';
import * as Rx from 'rxjs/Rx';

describe('Experiment with Tries', function() {
    it('Adds words to a Trie and takes them back out.', () => {
        const words = [...(new Set(sampleWords))];
        const trie = words
            .reduce((t, w) => {
                return Trie.insert(w, t);
            }, {} as Trie.TrieNode);
        expect(trie.c).to.not.be.undefined;
        const extractedWords = [...Trie.iteratorTrieWords(trie)];
        expect(extractedWords).to.be.deep.equal(words);

    });

    it('Adds words to a Trie sorts the trie and takes them back out.', () => {
        const words = [...(new Set(sampleWords))];
        const trie = Trie.createTriFromList(words);
        expect(trie.c).to.not.be.undefined;
        Trie.orderTrie(trie);
        const extractedWords = [...Trie.iteratorTrieWords(trie)];
        // console.log(extractedWords);
        expect(extractedWords).to.be.deep.equal(words.sort());
    });

    it('buildReferenceTree', () => {
        const words = [...(new Set(sampleWords))];
        const trie = Trie.createTriFromList(words);
        const asString = [...Trie.serializeTrie(trie, 10)].join('');
        const trie2 = Trie.createTriFromList(words);
        const asString2 = [...Trie.serializeTrie(trie2, { base: 10 })].join('');
        expect(asString2).to.be.equal(asString);
        const trie3 = Trie.createTriFromList(words);
        const asString3 = [...Trie.serializeTrie(trie3, { base: 10, comment: 'one\ntwo\nthree' })].join('');
        expect(asString3).to.not.be.equal(asString);
        expect(asString3.slice(asString3.indexOf('# Data'))).to.be.equal(asString.slice(asString.indexOf('# Data')));
        expect(asString3).to.contain('\n# one\n# two\n# three');
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

    it('buildReferenceTree default base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie)].join('');
        expect(text).to.contain('base=16');
    });


    it('buildReferenceTree too low base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie, 5)].join('');
        expect(text).to.contain('base=10');
    });

    it('buildReferenceTree too high base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie, 100)].join('');
        expect(text).to.contain('base=36');
    });

    it('buildReferenceTree undefined base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie, {})].join('');
        expect(text).to.contain('base=16');
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


