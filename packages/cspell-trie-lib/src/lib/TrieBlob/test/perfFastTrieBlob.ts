import assert from 'assert';

import type { TrieNode } from '../../../index.js';
import { createTrieRoot, insert, Trie } from '../../../index.js';
import { readTrie } from '../../../test/dictionaries.test.helper.js';
import { FastTrieBlob } from '../FastTrieBlob.js';
import { measure } from './perf.js';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

export async function measureFastBlob(which: string | undefined, method: string | undefined) {
    const trie = await getTrie();
    const words = trie.words().toArray();

    if (filterTest(which, 'blob')) {
        const ft = measure('blob.FastTrieBlob \t\t', () => FastTrieBlob.create(words));
        const trie = measure('blob.FastTrieBlob.toTrieBlob \t', () => ft.toTrieBlob());

        switch (method) {
            case 'has':
                measure('blob.TrieBlob.has \t\t', () => words.forEach((word) => assert(trie.has(word))));
                break;
        }
    }

    if (filterTest(which, 'fast')) {
        const ft = measure('fast.FastTrieBlob \t\t', () => FastTrieBlob.create(words));

        switch (method) {
            case 'has':
                measure('fast.FastTrieBlob.has \t\t', () => words.forEach((word) => assert(ft.has(word))));
                break;
        }
    }

    if (filterTest(which, 'trie')) {
        const root = createTrieRoot({});

        measure('trie.createTriFromList \t\t', () => insertWords(root, words));
        const trie = new Trie(root);

        switch (method) {
            case 'has':
                measure('trie.Trie.has \t\t\t', () => words.forEach((word) => assert(trie.hasWord(word, true))));
                break;
        }
    }
}

function filterTest(value: string | undefined, expected: string): boolean {
    return !value || value === expected || value == 'all';
}

function insertWords(root: TrieNode, words: string[]) {
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
}
