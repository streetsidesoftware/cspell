import assert from 'node:assert';

import { suite } from 'perf-insight';

import { ITrieImpl } from '../lib/ITrie.js';
import { readFastTrieBlobFromConfig, readTrieFromConfig } from '../test/dictionaries.test.helper.js';

// const measureTimeout = 100;

const getTrie = memorize(_getTrie);
const getFastTrieBlob = memorize(_getFastTrieBlob);
const getWords = memorize(async () => [...(await getTrie()).words()]);

suite('trie has', async (test) => {
    const trie = await getTrie();
    const words = await getWords();
    const fastTrieBlob = await getFastTrieBlob();
    const trieBlob = fastTrieBlob.toTrieBlob();
    const iTrieFast = new ITrieImpl(fastTrieBlob);
    const iTrieBlob = new ITrieImpl(trieBlob);

    test('trie has words', () => {
        trieHasWords(trie, words);
    });

    test('fastTrieBlob has words', () => {
        trieHasWords(fastTrieBlob, words);
    });

    test('trieBlob has words', () => {
        trieHasWords(trieBlob, words);
    });

    test('trieBlob.hasV1 has words', () => {
        trieHasWords({ has: (word) => trieBlob.hasV1(word) }, words);
    });

    test('iTrieFast has words', () => {
        trieHasWords(iTrieFast, words);
    });

    test('iTrieBlob has words', () => {
        trieHasWords(iTrieBlob, words);
    });
});

suite('encode to sequence', async (test) => {
    const words = await getWords();
    const fastTrieBlob = await getFastTrieBlob();
    const trieBlob = fastTrieBlob.toTrieBlob();

    test('fastTrieBlob.wordToNodeCharIndexSequence', () => {
        for (const word of words) {
            fastTrieBlob.wordToNodeCharIndexSequence(word);
        }
    });

    test('trieBlob.wordToNodeCharIndexSequence', () => {
        for (const word of words) {
            trieBlob.wordToNodeCharIndexSequence(word);
        }
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
