import { describe, expect, test } from 'vitest';

import { createTrieFromList } from '../TrieNode/trie-util.js';
import { walkerWordsITrie } from '../walker/walker.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

describe('FastTrieBlob', () => {
    const words = ['one', 'two', 'three', 'four', 'walk', 'walking', 'walks', 'wall', 'walls', 'walled'];

    test('toITrieNodeRoot', () => {
        const root = createTrieFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);
        const iter = walkerWordsITrie(iTrieRoot);
        expect([...iter]).toEqual(words);
    });

    test('toITrieNodeRoot.keys', () => {
        const root = createTrieFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);
        expect(iTrieRoot.keys()).toEqual([...new Set(words.map((w) => w[0]))]);
    });

    test('toITrieNodeRoot.values', () => {
        const root = createTrieFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);
        const keys = iTrieRoot.keys();
        const values = iTrieRoot.values();
        expect(values.length).toBe(keys.length);
        const valueIds = values.map((v) => v.id);
        const idsFromLookUp = keys.map((_, i) => iTrieRoot.child(i).id);
        expect(valueIds).toEqual(idsFromLookUp);
    });
});
