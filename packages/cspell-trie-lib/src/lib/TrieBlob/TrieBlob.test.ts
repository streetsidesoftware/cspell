import { describe, expect, test } from 'vitest';

import { createITrieFromList } from '../TrieNode/trie-util.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { walkerWordsITrie } from '../walker/walker.js';
import { createTrieBlob, createTrieBlobFromITrieNodeRoot, createTrieBlobFromTrieData } from './createTrieBlob.js';
import { TrieBlob } from './TrieBlob.js';

describe('TrieBlob', () => {
    const sampleWords = ['one', 'two', 'three', 'four', 'walk', 'walking', 'walks', 'wall', 'walls', 'walled'].sort();

    test('Constructor', () => {
        const tb = createTrieBlob(['one', 'two']);
        expect(tb).toBeDefined();
    });

    test('has', () => {
        const tb = createTrieBlob(['one', 'two']);
        expect(tb.has('one')).toBe(true);
        expect(tb.has('zero')).toBe(false);
    });

    test('words', () => {
        const tb = createTrieBlob(sampleWords);
        expect([...tb.words()]).toEqual(sampleWords);
        tb.encodeBin();
    });

    test('encode/decode', () => {
        const tb = createTrieBlob(sampleWords);
        const bin = tb.encodeBin();
        const r = TrieBlob.decodeBin(bin);
        expect(r).toEqual(tb);
        expect([...r.words()]).toEqual(sampleWords);
    });

    test('createTrieBlobFromITrieNodeRoot', () => {
        const root = createITrieFromList(sampleWords);
        const trieBlob = createTrieBlobFromITrieNodeRoot(root);
        expect([...trieBlob.words()]).toEqual(sampleWords);
    });

    test('createTrieBlobFromTrieData', () => {
        const root = TrieNodeTrie.createFromWords(sampleWords);
        const trieBlob = createTrieBlobFromTrieData(root);
        expect([...trieBlob.words()]).toEqual(sampleWords);
    });

    test('toITrieNodeRoot', () => {
        const root = createITrieFromList(sampleWords);
        const trieBlob = createTrieBlobFromITrieNodeRoot(root);
        const iter = walkerWordsITrie(trieBlob.getRoot());
        expect([...iter]).toEqual(sampleWords);
    });
});
