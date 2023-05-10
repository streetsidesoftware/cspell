import assert from 'assert';
import { readFileSync, writeFileSync } from 'fs';

import type { TrieNode } from '../../../index.js';
import { createTrieRoot, insert, Trie } from '../../../index.js';
import { readTrie } from '../../../test/dictionaries.test.helper.js';
import { FastTrieBlob } from '../FastTrieBlob.js';
import { TrieBlob } from '../TrieBlob.js';
import { measure } from './perf.js';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

function hasWords(words: string[], method: (word: string) => boolean): boolean {
    const len = words.length;
    let success = true;
    for (let i = 0; i < len; ++i) {
        success = method(words[i]) && success;
    }
    assert(success);
    return success;
}

export async function measureFastBlob(which: string | undefined, method: string | undefined) {
    const trie = await getTrie();
    const words = trie.words().toArray();

    if (filterTest(which, 'blob')) {
        const ft = measure('blob.FastTrieBlob \t\t', () => FastTrieBlob.fromTrieRoot(trie.root));
        const trieBlob = measure('blob.FastTrieBlob.toTrieBlob \t', () => ft.toTrieBlob());

        switch (method) {
            case 'has':
                measure('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => trieBlob.has(word)));
                measure('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => trieBlob.has(word)));
                break;
            case 'dump':
                writeFileSync('./TrieBlob.en.json', JSON.stringify(trieBlob, null, 2), 'utf8');
                writeFileSync('./TrieBlob.en.trieb', trieBlob.encodeBin());
                break;
            case 'decode':
                {
                    const tb = measure('blob.TrieBlob.decodeBin \t', () => {
                        return TrieBlob.decodeBin(readFileSync('./TrieBlob.en.trieb'));
                    });
                    measure('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => tb.has(word)));
                    measure('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => tb.has(word)));
                }
                break;
        }
    }

    if (filterTest(which, 'fast')) {
        const ft = measure('fast.FastTrieBlob \t\t', () => FastTrieBlob.fromWordList(words));

        switch (method) {
            case 'has':
                measure('fast.FastTrieBlob.has \t\t', () => hasWords(words, (word) => ft.has(word)));
                measure('fast.FastTrieBlob.has \t\t', () => hasWords(words, (word) => ft.has(word)));
                break;
        }
    }

    if (filterTest(which, 'trie')) {
        const root = createTrieRoot({});

        measure('trie.createTriFromList \t\t', () => insertWords(root, words));
        const trie = new Trie(root);

        switch (method) {
            case 'has':
                measure('trie.Trie.has \t\t\t', () => hasWords(words, (word) => trie.hasWord(word, true)));
                measure('trie.Trie.has \t\t\t', () => hasWords(words, (word) => trie.hasWord(word, true)));
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
