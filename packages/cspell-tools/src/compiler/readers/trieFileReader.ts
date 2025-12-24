import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

import { decodeTrie, type ITrie } from 'cspell-trie-lib';

import type { DictionaryReader } from './ReaderOptions.ts';

export async function trieFileReader(filename: string): Promise<DictionaryReader> {
    return TrieFileReader.create(filename);
}

export class TrieFileReader implements DictionaryReader {
    #trie: ITrie;

    readonly type = 'Trie';
    readonly filename: string;

    constructor(filename: string, trie: ITrie) {
        this.filename = filename;
        this.#trie = trie;
    }

    get size(): number {
        return this.#trie.size;
    }

    get lines(): Iterable<string> {
        return this.#trie.words();
    }

    hasWord(word: string, caseSensitive: boolean): boolean {
        return this.#trie.hasWord(word, caseSensitive);
    }

    toTrie(): ITrie {
        return this.#trie;
    }

    static async create(filename: string): Promise<TrieFileReader> {
        const rawBuffer = await readFile(filename);

        const buffer = filename.endsWith('.gz') ? gunzipSync(rawBuffer) : rawBuffer;

        const trie = decodeTrie(buffer);
        return new TrieFileReader(filename, trie);
    }
}
