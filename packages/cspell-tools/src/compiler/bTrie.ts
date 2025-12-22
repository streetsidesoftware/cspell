import { encodeTrieDataToBTrie } from 'cspell-trie-lib';

import { createReader } from './Reader.js';

export async function createBTrieFromFile(file: string): Promise<Uint8Array> {
    const reader = await createReader(file, {});

    const trie = reader.toTrie();

    return encodeTrieDataToBTrie(trie.data);
}
