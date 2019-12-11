import * as Trie from '.';
import { serializeTrie, importTrie } from './importExportV2';
import { readFile } from 'fs-extra';
import * as path from 'path';

describe('Import/Export', () => {
    test('tests serialize / deserialize', async () => {
        const trie = Trie.createTriFromList(sampleWords);
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const sample = (await readFile(path.join(__dirname, '..', '..', 'Samples', 'sampleV2.trie'), 'UTF-8')).replace(/\r?\n/g, '\n');
        expect(data).toBe(sample);
        const root = importTrie(data.split('\n'));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize / deserialize', async () => {
        const trie = Trie.createTriFromList(sampleWords);
        const data = [...serializeTrie(trie, 10)].join('');
        const root = importTrie(data.split('\n'));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
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
