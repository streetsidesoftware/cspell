import { describe, expect, test } from 'vitest';

import { readTrieFromConfig } from '../../test/dictionaries.test.helper.js';
import { countNodes as countITrieNodes, has } from '../ITrieNode/trie-util.js';
import type { TrieData } from '../TrieData.js';
import { trieRootToITrieRoot } from '../TrieNode/trie.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { createTrieBlob, createTrieBlobFromITrieNodeRoot, createTrieBlobFromTrieData } from './createTrieBlob.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

describe('FastTrieBlob', () => {
    const pTrie = getTrie();
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
        expect([...trieBlob.words()].sort()).toEqual([...words].sort());
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

    test('createTrieBlobFromITrieNodeRoot', async () => {
        const trie = await pTrie;
        const words = [...trie.words()];

        const trieBlobFromWords = FastTrieBlobBuilder.fromWordList(words).toTrieBlob();
        expect(words.every((word) => trieBlobFromWords.has(word))).toBe(true);

        const trieBlobFromTrie = FastTrieBlobBuilder.fromTrieRoot(trie.root).toTrieBlob();
        expect(words.every((word) => trieBlobFromTrie.has(word))).toBe(true);

        const iTrieRoot = trieRootToITrieRoot(trie.root);
        expect(words.every((word) => has(iTrieRoot, word))).toBe(true);

        const trieBlob = createTrieBlobFromITrieNodeRoot(iTrieRoot);
        let missing = 0;
        words.forEach((word) => {
            if (!trieBlob.has(word)) {
                !missing++ && console.log('First Missing:', word);
            }
        });
        missing && console.log('Missing: %d of %d', missing, words.length);
        expect(words.every((word) => trieBlob.has(word))).toBe(true);
    });
});

function createTrieData(words: string[]): TrieData {
    return TrieNodeTrie.createFromWordsAndConsolidate(words);
}

function countNodes(trieData: TrieData): number {
    return countITrieNodes(trieData.getRoot());
}

function getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}
