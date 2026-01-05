import { encodeTrieDataToBTrie } from 'cspell-trie-lib';

import { createReader } from './Reader.ts';

export interface GenerateBTrieOptions {
    compress?: boolean;
    optimize?: boolean;
    useStringTable?: boolean;
}

export async function createBTrieFromFile(file: string, buildOptions: GenerateBTrieOptions): Promise<Uint8Array> {
    const reader = await createReader(file, {});

    const trie = reader.toTrie();

    return encodeTrieDataToBTrie(trie.data, buildOptions);
}
