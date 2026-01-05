import type { BuildOptions } from '../BuildOptions.ts';
import type { TrieData } from '../TrieData.ts';
import { TrieBlob } from './TrieBlob.ts';
import { TrieBlobBuilder } from './TrieBlobBuilder.ts';

export function encodeTrieDataToBTrie(data: TrieData, buildOptions?: BuildOptions): Uint8Array<ArrayBuffer> {
    const needToBuild = buildOptions?.optimize || buildOptions?.useStringTable;
    if (!needToBuild && data.encodeToBTrie) {
        return data.encodeToBTrie();
    }

    const trie = TrieBlobBuilder.fromITrieRoot(data.getRoot(), buildOptions);
    return trie.encodeToBTrie();
}

export function decodeBTrie(data: Uint8Array<ArrayBuffer>): TrieBlob {
    return TrieBlob.decodeBin(data);
}
