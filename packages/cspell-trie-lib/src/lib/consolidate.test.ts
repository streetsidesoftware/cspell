import { readFile } from 'fs-extra';
import { genSequence } from 'gensequence';
import * as path from 'path';

import { resolveGlobalSample } from '../test/samples';
import { consolidate } from './consolidate';
import { countNodes, createTrieRoot, createTriFromList, iteratorTrieWords } from './trie-util';
import { buildTrie } from './TrieBuilder';
import type { TrieNode } from './TrieNode';

const samples = resolveGlobalSample('dicts');
const sampleEnglish = path.join(samples, 'en_US.txt');
const pSampleEnglishWords = readFile(sampleEnglish, 'utf8').then((a) => a.split('\n').filter((a) => !!a));

describe('Validate Consolidate', () => {
    test('consolidate', () => {
        const trie = createTriFromList(sampleWords);
        const origCount = countNodes(trie);
        const trie2 = consolidate(trie);
        const countTrie2 = countNodes(trie2);
        const countTrie = countNodes(trie);
        expect(countTrie2).toBeLessThan(origCount);
        expect(countTrie2).toBe(countTrie);
        const words = [...walk(trie2)];
        expect(words).toEqual(sampleWords.sort());
        const trie3 = consolidate(trie);
        const countTrie3 = countNodes(trie3);
        expect(countTrie3).toBe(countTrie2);
        expect(countNodes(consolidate(createTriFromList(sampleWords)))).toBe(96);
    });

    test('consolidate empty trie', () => {
        const root = createTrieRoot({});
        const result = consolidate(root);
        expect(countNodes(result)).toBe(1);
        expect(result).toEqual(root);
    });

    test('larger trie', async () => {
        const words = await pSampleEnglishWords;
        words.length = Math.min(words.length, 2000);
        const trie = consolidate(createTriFromList(words));
        const result = [...iteratorTrieWords(trie)];
        expect(result).toEqual(words);
        const trie2 = consolidate(buildTrie(words).root);
        const result2 = [...iteratorTrieWords(trie2)];
        expect(result2).toEqual(words);
        expect(countNodes(trie)).toBe(countNodes(trie2));
    });
});

function walk(root: TrieNode): IterableIterator<string> {
    function* w(node: TrieNode, prefix: string): IterableIterator<string> {
        if (node.f) {
            yield prefix;
        }
        if (node.c) {
            yield* genSequence(node.c).concatMap((a) => genSequence(w(a[1], a[0])).map((suffix) => prefix + suffix));
        }
    }
    return w(root, '');
}

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
