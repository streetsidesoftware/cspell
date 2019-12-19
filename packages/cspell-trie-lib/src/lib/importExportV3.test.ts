import * as Trie from '.';
import { serializeTrie, importTrie } from './importExportV3';
import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { consolidate } from './consolidate';

const sampleFile = path.join(__dirname, '..', '..', 'Samples', 'sampleV3.trie');

describe('Import/Export', () => {

    test('tests serialize / deserialize small sample', async () => {
        const trie = Trie.buildTrie(smallSample).root;
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const root = importTrie(data.split('\n').map(a => a ? a + '\r\n' : a));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...smallSample].sort());
    });

    test('tests serialize / deserialize specialCharacters', async () => {
        const trie = Trie.buildTrie(specialCharacters).root;
        const data = [...serializeTrie(trie, 10)];
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...specialCharacters].sort());
    });

    test('tests serialize / deserialize', async () => {
        const trie = Trie.buildTrie(sampleWords).root;
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const root = importTrie(data.split('\n').map(a => a ? a + '\n' : a));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
        await writeFile(sampleFile, data);
    });

    test('tests deserialize from file', async () => {
        const sample = (await readFile(sampleFile, 'UTF-8')).replace(/\r?\n/g, '\n');
        const root = importTrie(sample.split('\n'));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize / deserialize', async () => {
        const trie = Trie.buildTrie(sampleWords).root;
        const data = serializeTrie(trie, 10);
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize DAWG', async () => {
        const trie = Trie.createTriFromList(sampleWords);
        const trieDawg = consolidate(trie);
        const data = [...serializeTrie(trieDawg, 10)];
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });
});

const specialCharacters = [
    'arrow <',
    'escape \\',
    'eol \n',
    'eow $',
    'ref #',
    'Numbers 0123456789',
    'Braces: {}[]()',
];

const smallSample = [
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
];

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
].concat(specialCharacters);
