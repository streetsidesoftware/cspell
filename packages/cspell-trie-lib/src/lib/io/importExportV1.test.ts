import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

import { resolveSample } from '../../test/samples.js';
import { consolidate } from '../consolidate.js';
import * as Trie from '../index.js';
import { iteratorTrieWords } from '../TrieNode/trie-util.js';
import { importTrie, serializeTrie } from './importExportV1.js';

describe('Import/Export', () => {
    test('tests serialize / deserialize', async () => {
        const trie = consolidate(Trie.createTrieRootFromList(sampleWords));
        const data = [...serializeTrie(trie, 10)];
        const sample = (await readFile(resolveSample('sampleV1.trie'), 'utf8')).replaceAll('\r', '');
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
