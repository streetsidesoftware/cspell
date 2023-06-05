import { readFile } from 'fs/promises';
import { describe, expect, test } from 'vitest';

import { resolveSample } from '../../test/samples.js';
import * as Trie from '../index.js';
import { importTrie, serializeTrie } from './importExportV2.js';

describe('Import/Export', () => {
    test('tests serialize / deserialize from trie', async () => {
        const trie = Trie.createTrieRootFromList(sampleWords);
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const sample = (await readFile(resolveSample('sampleV2.trie'), 'utf8')).replace(/\r?\n/g, '\n');
        expect(data).toBe(sample);
        const root = importTrie(data.split('\n'));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('serialize / deserialize with object', async () => {
        const trie = Trie.createTrieRootFromList(sampleWords);
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
