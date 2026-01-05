import type { TrieData } from '../TrieData.ts';
import { TrieBlob } from './TrieBlob.ts';
import { TrieBlobBuilder } from './TrieBlobBuilder.ts';

export function encodeTrieDataToBTrie(data: TrieData, optimize?: boolean): Uint8Array<ArrayBuffer> {
    if (!optimize && data.encodeToBTrie) {
        return data.encodeToBTrie();
    }

    const trie = TrieBlobBuilder.fromITrieRoot(data.getRoot(), optimize);
    return trie.encodeToBTrie();
}

export function decodeBTrie(data: Uint8Array<ArrayBuffer>): TrieBlob {
    return TrieBlob.decodeBin(data);
}
