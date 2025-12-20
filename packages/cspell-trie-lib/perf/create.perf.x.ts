import { suite } from 'perf-insight';

import { buildITrieFromWords } from '../src/lib/index.ts';
import { createTrieBlobFromTrieRoot } from '../src/lib/TrieBlob/createTrieBlob.ts';
import { FastTrieBlob } from '../src/lib/TrieBlob/FastTrieBlob.ts';
import { FastTrieBlobBuilder } from '../src/lib/TrieBlob/FastTrieBlobBuilder.ts';
import { createTrieRootFromList } from '../src/lib/TrieNode/trie-util.ts';
import { readTrieFromConfig } from '../src/test/dictionaries.test.helper.ts';

// const measureTimeout = 100;

const getTrie = memorize(_getTrie);
const getWords = memorize(async () => [...(await getTrie()).words()]);

suite('trie create', async (test) => {
    const words = await getWords();
    const trie = createTrieRootFromList(words);
    const fastTrie = FastTrieBlobBuilder.fromWordList(words);
    console.error('Info: %o', {
        wordsSize: words.length,
        fastTrieSize: fastTrie.size,
        fastTrieSmallSize: FastTrieBlobBuilder.fromWordList(words.slice(-1000)).size,
    });
    const trieBlob = fastTrie.toTrieBlob();

    test('FastTrieBlobBuilder.insert.build', () => {
        const builder = new FastTrieBlobBuilder();
        builder.insert(words);
        builder.build();
    });

    test('ITrie buildITrieFromWords', () => {
        buildITrieFromWords(words);
    });

    test('FastTrieBlobBuilder.fromWordList', () => {
        FastTrieBlobBuilder.fromWordList(words);
    });

    test('FastTrieBlobBuilder.fromTrieRoot', () => {
        FastTrieBlobBuilder.fromTrieRoot(trie);
    });

    test('FastTrieBlob.fromTrie', () => {
        FastTrieBlob.fromTrieBlob(trieBlob);
    });

    test('TrieRoot createTrieRootFromList', () => {
        createTrieRootFromList(words);
    });

    test('TrieBlob createTrieBlobFromTrieRoot', () => {
        createTrieBlobFromTrieRoot(trie);
    });

    test('TrieBlob fastTrie.toTrieBlob', () => {
        fastTrie.toTrieBlob();
    });
});

function _getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
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
