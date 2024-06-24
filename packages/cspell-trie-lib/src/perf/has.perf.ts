import assert from 'node:assert';

import { suite } from 'perf-insight';

import { readFastTrieBlobFromConfig, readTrieFromConfig } from '../test/dictionaries.test.helper.js';

// const measureTimeout = 100;

const getTrie = memorize(_getTrie);
const getFastTrieBlob = memorize(_getFastTrieBlob);
const getWords = memorize(async () => [...(await getTrie()).words()]);

suite('trie has', async (test) => {
    const trie = await getTrie();
    const words = await getWords();
    const fastTrieBlob = await getFastTrieBlob();

    test('trie has words', () => {
        trieHasWords(trie, words);
    });

    test('fastTrieBlob has words', () => {
        trieHasWords(fastTrieBlob, words);
    });
});

function _getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function _getFastTrieBlob() {
    return readFastTrieBlobFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function trieHasWords(trie: { has: (word: string) => boolean }, words: string[]): boolean {
    const has = (word: string) => trie.has(word);
    const len = words.length;
    let success = true;
    for (let i = 0; i < len; ++i) {
        success = has(words[i]) && success;
    }
    assert(success);
    return success;
}

function memorize<T, P extends []>(fn: (...p: P) => T): (...p: P) => T {
    let p: P | undefined = undefined;
    let r: { v: T } | undefined = undefined;
    return (...pp: P) => {
        if (r && p && p.length === pp.length && p.every((v, i) => v === pp[i])) {
            return r?.v;
        }
        p = pp;
        const v = fn(...pp);
        r = { v };
        return v;
    };
}

// cspell:ignore tion aeiou
