import { promises as fs } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { walkerWordsITrie } from '../walker/walker.js';
import { createTrieBlob } from './createTrieBlob.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

const sampleDirUrl = new URL('../../../Samples/', import.meta.url);
const sampleWords: Promise<readonly string[]> = readWordsFile('emoji-sequences.txt');

const debug = false;

describe('FastTrieBlob', () => {
    const words = ['one', 'two', 'three', 'four', 'walk', 'walking', 'walks', 'wall', 'walls', 'walled'];

    test('toITrieNodeRoot', () => {
        const trie = createTrieBlob(words);
        const iTrieRoot = trie.getRoot();
        const iter = walkerWordsITrie(iTrieRoot);
        expect([...iter]).toEqual(words.sort());
    });

    test('toITrieNodeRoot.keys', () => {
        const trie = createTrieBlob(words);
        const iTrieRoot = trie.getRoot();
        expect(iTrieRoot.keys()).toEqual([...new Set(words.map((w) => w[0]))].sort());
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

    test('toITrieNodeRoot with large number of characters', async () => {
        const words = await sampleWords;
        const sWords = [...words].sort();
        const setOfWords = new Set(sWords);
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const ftWords = [...ft.words()].sort();
        debug && (await fs.writeFile('fastTrieBlob.json', JSON.stringify(ft, null, 2), 'utf8'));
        expect(ftWords).toEqual(sWords);
        const trie = createTrieBlob(sWords);
        const ft2 = FastTrieBlob.fromTrieBlob(trie);
        expect(ft2.toJSON()).toEqual(ft.toJSON());
        const trieWords = [...trie.words()].sort();
        debug && (await fs.writeFile('trieBlob.json', JSON.stringify(trie, null, 2), 'utf8'));
        debug && (await fs.writeFile('fastTrieBlob2.json', JSON.stringify(ft2, null, 2), 'utf8'));
        expect(trieWords).toEqual(sWords);

        const iTrieRoot = trie.getRoot();
        for (const word of walkerWordsITrie(iTrieRoot)) {
            expect(setOfWords.has(word), `Expect to find "${word} in set of words."`).toBe(true);
        }

        const iter = walkerWordsITrie(iTrieRoot);

        const result = [...iter];

        const rSet = new Set(result);
        const wSet = new Set(sWords);
        const missing = exclude(wSet, rSet);
        const extra = exclude(rSet, wSet);

        missing.size && console.log('Missing: %o', missing);
        expect(missing.size, 'No missing').toBe(0);
        extra.size && console.log('Extra: %o', extra);
        expect(extra.size, 'No extras').toBe(0);
    });
});

function readSampleFile(samplePath: string | URL): Promise<string> {
    return fs.readFile(new URL(samplePath, sampleDirUrl), 'utf8');
}

async function readWordsFile(samplePath: string | URL): Promise<readonly string[]> {
    const text = await readSampleFile(samplePath);
    const words = [...new Set(text.normalize('NFC').split(/[\s\p{P}+~]/gu))].sort().filter((a) => !!a);
    const setUniqueLetters = new Set<string>();
    const wordsWithUniqueLetters = words.filter((word) => {
        const s = setUniqueLetters.size;
        [...word].forEach((c) => setUniqueLetters.add(c));
        return setUniqueLetters.size > s;
    });
    Object.freeze(wordsWithUniqueLetters);
    return wordsWithUniqueLetters;
}

function exclude<T>(a: Set<T>, b: Set<T>): Set<T> {
    a = new Set(a);
    for (const v of b) {
        a.delete(v);
    }
    return a;
}
