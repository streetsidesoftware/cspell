import assert from 'node:assert';

import { suite } from 'perf-insight';

import type { Trie } from '../src/lib/index.ts';
import { TrieBlob } from '../src/lib/TrieBlob/TrieBlob.ts';
import { TrieBlobBuilder } from '../src/lib/TrieBlob/TrieBlobBuilder.ts';
import type { TrieData } from '../src/lib/TrieData.ts';
import { TrieNodeTrie } from '../src/lib/TrieNode/TrieNodeTrie.ts';
import { walkerWordsITrie } from '../src/lib/walker/walker.ts';
import { readTrieBlobFromConfig, readTrieFromConfig } from '../src/test/dictionaries.test.helper.ts';

// const weightMapEn = getEnglishWeightMap();

class DI {
    private _trie = lazy(() => getTrie());

    get trie() {
        return this._trie();
    }

    private _trieTrie = lazy(async () => {
        return new TrieNodeTrie((await this.trie).root);
    });

    get trieTrie() {
        return this._trieTrie();
    }

    private _trieFast = lazy(() => {
        return getTrieBlob();
    });

    get trieBlobNL() {
        return this._trieFastNL();
    }

    private _trieFastNL = lazy(() => getTrieBlobNL());

    get trieBlob() {
        return this._trieFast();
    }

    private _words = lazy(async () => {
        const trie = await this.trie;
        const words = [...trie.words()];
        return words;
    });

    get words() {
        return this._words();
    }
}

interface TestDependencies {
    trie: Trie;
    words: string[];
    trieBlob: TrieBlob;
    trieBlobNL: TrieBlob;
}

type DependenciesKeys = keyof TestDependencies;

const di = new DI();

// const measureTimeout = 100;

suite('blob.FastTrieBlobBuilder', async (test) => {
    const { trie, words, trieBlob } = await prepareDI(['trie', 'words', 'trieBlob']);
    assert(!words.some((w) => !trieBlob.has(w)), 'Expect all words to be found in trieFast.');
    assert(!words.some((w) => !trie.has(w)), 'Expect all words to be found in trie.');
    assert(!words.some((w) => !trieBlob.has(w)), 'Expect all words to be found in trieBlob. p1');

    test('TrieBlobBuilder.fromTrieRoot', () => TrieBlobBuilder.fromTrieRoot(trie.root));

    test('blob.TrieBlob.has', () => trieHasWords(trieBlob, words));
    test('blob.words', () => [...trieBlob.words()]);
    test('blob.walkerWordsITrie', () => [...walkerWordsITrie(trieBlob.getRoot())]);

    test('JSON.stringify', () => JSON.stringify(trieBlob, undefined, 2));
    test('encodeBin', () => trieBlob.encodeBin());

    const trieBlobBin = trieBlob.encodeBin();
    test('decodeBin', () => TrieBlob.decodeBin(trieBlobBin));

    const trieBlob2 = TrieBlob.decodeBin(trieBlobBin);
    assert(!words.some((w) => !trieBlob.has(w)), 'Expect all words to be found in trieBlob. p2');
    assert(!words.some((w) => !trieBlob2.has(w)), 'Expect all words to be found in trieBlob2.');
    test('blob.TrieBlob.has', () => trieHasWords(trieBlob2, words));
});

type AwaitedRecord<T> = { [K in keyof T]: AwaitedFnOrValue<T[K]> };

type AwaitedFnOrValue<T> = T extends () => infer P ? Awaited<P> : Awaited<T>;

async function prepareDI<K extends DependenciesKeys>(keys: K[]): Promise<AwaitedRecord<Pick<TestDependencies, K>>> {
    const prep: Record<string, unknown> = {};

    for (const key of keys) {
        prep[key] = await di[key];
    }

    return prep as AwaitedRecord<Pick<TestDependencies, K>>;
}

function getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function getTrieBlob() {
    return readTrieBlobFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function getTrieBlobNL() {
    return readTrieBlobFromConfig('@cspell/dict-nl-nl/cspell-ext.json');
}

function trieHasWords(trie: TrieData, words: string[]): boolean {
    const has = (word: string) => trie.has(word);
    const len = words.length;
    let success = true;
    let missing = 0;
    for (let i = 0; i < len; ++i) {
        const r = has(words[i]);
        success &&= r;
        if (!r) {
            !missing++ && console.error(`Word not found: ${words[i]}`);
        }
    }
    assert(success, `Expect all words to be found in the trie. Found ${missing} out of ${len} words missing.`);
    return success;
}

function lazy<T>(fn: () => T): () => T {
    let r: { v: T } | undefined = undefined;
    return () => {
        if (r) return r.v;
        const v = fn();
        r = { v };
        return v;
    };
}

// cspell:ignore tion aeiou
