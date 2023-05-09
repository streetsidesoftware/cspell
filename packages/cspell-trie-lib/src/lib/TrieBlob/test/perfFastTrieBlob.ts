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

    const ft = new FastTrieBlob();

    if (match(which, 'blob')) {
        measure('FastTrieBlob', () => ft.insert(words));

        switch (method) {
            case 'has':
                measure('FastTrieBlob.has', () => words.forEach((word) => assert(ft.has(word))));
                break;
        }
    }

    if (match(which, 'trie')) {
        const root = createTrieRoot({});

        measure('createTriFromList', () => insertWords(root, words));
        const trie = new Trie(root);

        switch (method) {
            case 'has':
                measure('Trie.has', () => words.forEach((word) => assert(trie.hasWord(word, true))));
                break;
        }
    }
}

function match(value: string | undefined, expected: string): boolean {
    return !value || value === expected;
}

function insertWords(root: TrieNode, words: string[]) {
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
}
