import { describe, expect, test } from 'vitest';

import { trieRootToITrieRoot } from '../TrieNode/trie.ts';
import { createTrieRootFromList } from '../TrieNode/trie-util.ts';
import { createTrieBlob, createTrieBlobFromITrieRoot, createTrieBlobFromTrieRoot } from './createTrieBlob.ts';

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

    test('createTrieBlob', () => {
        const trieBlob = createTrieBlob(words);
        expect([...trieBlob.words()]).toEqual([...words].sort());
    });

    test('createTrieBlobFromITrieRoot', () => {
        const src = createTrieBlob(words);
        const trieBlob = createTrieBlobFromITrieRoot(src.getRoot());
        expect([...trieBlob.words()]).toEqual([...words].sort());
    });

    test('createTrieBlobFromTrieRoot', () => {
        const src = createTrieRootFromList(words);
        const trieBlob = createTrieBlobFromTrieRoot(src);
        expect([...trieBlob.words()]).toEqual([...words].sort());
    });

    test('createTrieBlobFromITrieRoot using trieRootToITrieRoot', () => {
        const src = createTrieRootFromList(words);
        const trieBlob = createTrieBlobFromITrieRoot(trieRootToITrieRoot(src));
        expect([...trieBlob.words()]).toEqual([...words].sort());
    });
});
