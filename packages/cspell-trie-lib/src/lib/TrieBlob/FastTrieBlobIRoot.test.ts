import { describe, expect, test } from 'vitest';

import { findWord } from '../ITrieNode/find.js';
import { createTrieRootFromList } from '../TrieNode/trie-util.js';
import { walkerWordsITrie } from '../walker/walker.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

describe('FastTrieBlob', () => {
    const words = ['one', 'two', 'three', 'four', 'walk', 'walking', 'walks', 'wall', 'walls', 'walled'];

    test('toITrieNodeRoot', () => {
        const root = createTrieRootFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);
        const iter = walkerWordsITrie(iTrieRoot);
        expect([...iter]).toEqual(words.sort());
    });

    test('toITrieNodeRoot.keys', () => {
        const root = createTrieRootFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);
        expect(iTrieRoot.keys()).toEqual([...new Set(words.map((w) => w[0]))].sort());
    });

    test('toITrieNodeRoot.keys large character set', () => {
        const words = genWords();
        const root = createTrieRootFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);
        expect(iTrieRoot.keys()).toEqual([...new Set(words.map((w) => [...w][0]))]);
    });

    test('toITrieNodeRoot.values', () => {
        const root = createTrieRootFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);
        const keys = iTrieRoot.keys();
        const values = iTrieRoot.values();
        expect(values.length).toBe(keys.length);
        const valueIds = values.map((v) => v.id);
        const idsFromLookUp = keys.map((_, i) => iTrieRoot.child(i).id);
        expect(valueIds).toEqual(idsFromLookUp);
    });

    test('extended number of letters', () => {
        const words = genWords();
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const iTrieRoot = FastTrieBlob.toITrieNodeRoot(ft);

        for (const word of words) {
            expect(ft.has(word), `word "${word}" to be found in ft`).toBe(true);
            expect(findWord(iTrieRoot, word).found, `word ${word} to be found in iTrieRoot`).toBeTruthy();
        }
    });
});

let letters: string | undefined;

function genLetters(count = 500): string {
    if (letters) return letters;
    const chars: string[] = [];
    for (let i = 'A'.codePointAt(0) || 0; i < count; ++i) {
        chars.push(String.fromCodePoint(i));
    }
    letters = chars.join('').replaceAll(/\P{L}/gu, '');
    return letters;
}

function genWords() {
    const letters = genLetters();
    const words = letters.replaceAll(/(.{5})/g, '$1|').split('|');
    return words.filter((a) => !!a);
}
