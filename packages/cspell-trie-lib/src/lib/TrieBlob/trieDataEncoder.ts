import type { TrieData } from '../TrieData.ts';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.ts';
import { TrieBlob } from './TrieBlob.ts';

export function encodeTrieDataToBTrie(data: TrieData): Uint8Array<ArrayBuffer> {
    if (data.encodeToBTrie) {
        return data.encodeToBTrie();
    }

    const trie = FastTrieBlobBuilder.fromWordList(data.words(), data.info);
    return trie.encodeToBTrie();
}

export function decodeBTrie(data: Uint8Array<ArrayBuffer>): TrieBlob {
    return TrieBlob.decodeBin(data);
}
