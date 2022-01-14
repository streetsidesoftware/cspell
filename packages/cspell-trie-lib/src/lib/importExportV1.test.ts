import * as Trie from '.';
import { serializeTrie, importTrie } from './importExportV1';
import { readFile } from 'fs-extra';
import * as path from 'path';
import { consolidate } from './consolidate';
import { iteratorTrieWords } from './trie-util';

describe('Import/Export', () => {
    test('tests serialize / deserialize', async () => {
        const trie = consolidate(Trie.createTriFromList(sampleWords));
        const data = [...serializeTrie(trie, 10)];
        const sample = (await readFile(path.join(__dirname, '..', '..', 'Samples', 'sampleV1.trie'), 'utf8')).replace(
            /\r/g,
            ''
        );
        const rawData = data.join('');
        expect(rawData.length).toBeLessThanOrEqual(sample.length);
        const sampleRoot = importTrie(sample.split('\n'));
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect([...iteratorTrieWords(sampleRoot)]).toEqual(words);
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
