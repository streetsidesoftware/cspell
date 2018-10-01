import {expect} from 'chai';
import * as Trie from '.';
import {from} from 'rxjs';

describe('Import/Export', function() {
    it('tests serialize / deserialize', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const data = [...Trie.serializeTrie(trie, 10)];
        // return Trie.importTrieRx(from(data)).pipe(take(1), toArray()).toPromise().then(([root]) => {
        return Trie.importTrieRx(from(data)).toPromise().then((root) => {
            const words = [...Trie.iteratorTrieWords(root)];
            expect(words).to.deep.equal([...sampleWords].sort());
        });
    });
});

const sampleWords = [
    'journal',
    'journalism',
    'journalist',
    'journalistic',
    'journals',
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
    'lift',
    'lifted',
    'lifter',
    'lifting',
    'lifts',
    'talk',
    'talked',
    'talker',
    'talking',
    'talks',
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'Big Apple',
    'New York',
    'apple',
    'big apple',
    'fun journey',
    'long walk',
    'fun walk',
];
