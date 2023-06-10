import { describe, expect, test } from 'vitest';

import { countNodes as countITrieNodes } from '../ITrieNode/trie-util.js';
import type { TrieData } from '../TrieData.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { createTrieBlob, createTrieBlobFromTrieData } from './createTrieBlob.js';

describe('FastTrieBlob', () => {
    const words = [
        'one',
        'two',
        'three',
        'four',
        'walk',
        'walking',
        'walks',
        'walked',
        'wall',
        'walls',
        'walled',
        'talk',
        'talked',
        'talking',
        'talks',
    ];

    test('createTrieBlobFromTrieData', () => {
        const trieData = createTrieData(words);
        const trieBlob = createTrieBlobFromTrieData(trieData);
        const count = countNodes(trieData);
        const countBlob = trieBlob.size;
        expect(countBlob).toBe(count);
        expect([...trieBlob.words()]).toEqual([...words].sort());
        expect(words.findIndex((word) => !trieBlob.has(word))).toBe(-1);
    });

    test('createTrieBlob', () => {
        const trieBlob = createTrieBlob(words);
        expect([...trieBlob.words()].sort()).toEqual([...words].sort());
    });

    test('count', () => {
        const trieData = createTrieData(words);
        const trieBlob = createTrieBlobFromTrieData(trieData);
        const count = countNodes(trieData);
        const countBlob = trieBlob.size;
        expect(countBlob).toBe(count);
        const iTrieRoot = trieBlob.getRoot();
        const countITrie = countITrieNodes(iTrieRoot);
        expect(countBlob).toBe(count);
        // The node returned by walking an ITrie in not guaranteed to be unique.
        expect(countITrie).toBe(countBlob);
    });
});

function createTrieData(words: string[]): TrieData {
    return TrieNodeTrie.createFromWordsAndConsolidate(words);
}

function countNodes(trieData: TrieData): number {
    return countITrieNodes(trieData.getRoot());
}
