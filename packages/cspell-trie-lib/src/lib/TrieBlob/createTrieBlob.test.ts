import { describe, expect, test } from 'vitest';

import { consolidate } from '../consolidate.js';
import { countNodes as countITrieNodes } from '../ITrieNode/trie-util.js';
import { trieRootToITrieRoot } from '../TrieNode/trie.js';
import { countNodes, createTrieFromList } from '../TrieNode/trie-util.js';
import { createTrieBlobFromITrieNodeRoot, createTrieBlobFromTrieRoot } from './createTrieBlob.js';
import { TrieBlob } from './TrieBlob.js';

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

    test('createTrieBlobFromTrieRoot', () => {
        const trieRoot = consolidate(createTrieFromList(words));
        const trieBlob = createTrieBlobFromTrieRoot(trieRoot);
        const count = countNodes(trieRoot);
        const countBlob = trieBlob.countNodes();
        expect(countBlob).toBe(count);
        expect([...trieBlob.words()]).toEqual([...words].sort());
        expect(words.findIndex((word) => !trieBlob.has(word))).toBe(-1);
    });

    test('createTrieBlobFromTrieRoot', () => {
        const trieRoot = consolidate(createTrieFromList(words));
        const iTrieRoot = trieRootToITrieRoot(trieRoot);
        const trieBlob = createTrieBlobFromITrieNodeRoot(iTrieRoot);
        const count = countNodes(trieRoot);
        const countBlob = trieBlob.countNodes();
        expect(countBlob).toBe(count);
        expect([...trieBlob.words()]).toEqual([...words].sort());
        expect(words.findIndex((word) => !trieBlob.has(word))).toBe(-1);
    });

    test('count', () => {
        const trieRoot = consolidate(createTrieFromList(words));
        const trieBlob = createTrieBlobFromTrieRoot(trieRoot);
        const count = countNodes(trieRoot);
        const countBlob = trieBlob.countNodes();
        expect(countBlob).toBe(count);
        const iTrieRoot = TrieBlob.toITrieNodeRoot(trieBlob);
        const countITrie = countITrieNodes(iTrieRoot);
        expect(countBlob).toBe(count);
        // The node returned by walking an ITrie in not guaranteed to be unique.
        expect(countITrie).toBe(countBlob);
    });
});
