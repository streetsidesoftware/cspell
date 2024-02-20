import { describe, expect, test } from 'vitest';

import { walkerWordsITrie } from '../walker/walker.js';
import { createTrieBlob } from './createTrieBlob.js';

describe('FastTrieBlob', () => {
    const words = ['one', 'two', 'three', 'four', 'walk', 'walking', 'walks', 'wall', 'walls', 'walled'];

    test('toITrieNodeRoot', () => {
        const trie = createTrieBlob(words);
        const iTrieRoot = trie.getRoot();
        const iter = walkerWordsITrie(iTrieRoot);
        expect([...iter]).toEqual(words);
    });

    test('toITrieNodeRoot.keys', () => {
        const trie = createTrieBlob(words);
        const iTrieRoot = trie.getRoot();
        expect(iTrieRoot.keys()).toEqual([...new Set(words.map((w) => w[0]))]);
    });

    test('toITrieNodeRoot.values', () => {
        const trie = createTrieBlob(words);
        const iTrieRoot = trie.getRoot();
        const keys = iTrieRoot.keys();
        const values = iTrieRoot.values();
        expect(values.length).toBe(keys.length);
        const valueIds = values.map((v) => v.id);
        const idsFromLookUp = keys.map((_, i) => iTrieRoot.child(i).id);
        expect(valueIds).toEqual(idsFromLookUp);
    });
});
