import type { TrieData } from '../TrieData.ts';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.ts';

export function encodeTrieDataToBTrie(data: TrieData): Uint8Array {
    if (data.encodeToBTrie) {
        return data.encodeToBTrie();
    }

    const trie = FastTrieBlobBuilder.fromWordList(data.words(), data.info);
    return trie.encodeToBTrie();
}
