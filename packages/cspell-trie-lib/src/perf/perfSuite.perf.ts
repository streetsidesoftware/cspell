import assert from 'node:assert';

import { suite } from 'perf-insight';

import type { Trie } from '../lib/index.js';
import { createTrieBlobFromITrieNodeRoot } from '../lib/TrieBlob/createTrieBlob.js';
import type { FastTrieBlob } from '../lib/TrieBlob/FastTrieBlob.js';
import { FastTrieBlobBuilder } from '../lib/TrieBlob/FastTrieBlobBuilder.js';
import { TrieBlob } from '../lib/TrieBlob/TrieBlob.js';
import type { TrieData } from '../lib/TrieData.js';
import { trieRootToITrieRoot } from '../lib/TrieNode/trie.js';
import { TrieNodeTrie } from '../lib/TrieNode/TrieNodeTrie.js';
import { walkerWordsITrie } from '../lib/walker/walker.js';
import { readFastTrieBlobFromConfig, readTrieFromConfig } from '../test/dictionaries.test.helper.js';

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
        return getFastTrieBlob();
    });

    get trieFastNL() {
        return this._trieFastNL();
    }

    private _trieFastNL = lazy(() => getFastTrieBlobNL());

    get trieFast() {
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
    trieFast: FastTrieBlob;
    trieFastNL: FastTrieBlob;
}

type DependenciesKeys = keyof TestDependencies;

const di = new DI();

// const measureTimeout = 100;

suite('blob.FastTrieBlobBuilder', async (test) => {
    const { trie, words } = await prepareDI(['trie', 'words']);
    const trieBlob = createTrieBlobFromITrieNodeRoot(trieRootToITrieRoot(trie.root));

    test('FastTrieBlobBuilder.fromTrieRoot', () => FastTrieBlobBuilder.fromTrieRoot(trie.root));

    test.prepare(() => FastTrieBlobBuilder.fromTrieRoot(trie.root)).test(
        'blob.FastTrieBlobBuilder.fromTrieRoot',
        (ft) => ft.toTrieBlob(),
    );

    test('blob.createTrieBlobFromITrieNodeRoot', () => createTrieBlobFromITrieNodeRoot(trieRootToITrieRoot(trie.root)));

    test('blob.TrieBlob.has', () => trieHasWords(trieBlob, words));
    test('blob.words', () => [...trieBlob.words()]);
    test('blob.walkerWordsITrie', () => [...walkerWordsITrie(trieBlob.getRoot())]);

    test('JSON.stringify', () => JSON.stringify(trieBlob, undefined, 2));
    test('encodeBin', () => trieBlob.encodeBin());

    const trieBlobBin = trieBlob.encodeBin();
    test('decodeBin', () => TrieBlob.decodeBin(trieBlobBin));

    const trieBlob2 = TrieBlob.decodeBin(trieBlobBin);
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

function getFastTrieBlob() {
    return readFastTrieBlobFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function getFastTrieBlobNL() {
    return readFastTrieBlobFromConfig('@cspell/dict-nl-nl/cspell-ext.json');
}

function trieHasWords(trie: TrieData, words: string[]): boolean {
    const has = (word: string) => trie.has(word);
    const len = words.length;
    let success = true;
    for (let i = 0; i < len; ++i) {
        success = has(words[i]) && success;
    }
    assert(success);
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
