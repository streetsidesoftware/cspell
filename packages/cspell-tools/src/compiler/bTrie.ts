import { encodeTrieDataToBTrie } from 'cspell-trie-lib';

import { createReader } from './Reader.ts';

export async function createBTrieFromFile(file: string, optimize: boolean): Promise<Uint8Array> {
    const reader = await createReader(file, {});

    const trie = reader.toTrie();

    return encodeTrieDataToBTrie(trie.data, optimize);
}
