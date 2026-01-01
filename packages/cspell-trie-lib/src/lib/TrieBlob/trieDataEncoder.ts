import type { TrieData } from '../TrieData.ts';
import { TrieBlob } from './TrieBlob.ts';
import { TrieBlobBuilder } from './TrieBlobBuilder.ts';

export function encodeTrieDataToBTrie(data: TrieData): Uint8Array<ArrayBuffer> {
    if (data.encodeToBTrie) {
        return data.encodeToBTrie();
    }

    const trie = TrieBlobBuilder.fromWordList(data.words(), data.info);
    return trie.encodeToBTrie();
}

export function decodeBTrie(data: Uint8Array<ArrayBuffer>): TrieBlob {
    return TrieBlob.decodeBin(data);
}
