import type { TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';

export interface TrieBlobInfo {
    readonly nodes: Uint32Array;
    readonly info: Readonly<Partial<TrieInfo>>;
    readonly characteristics: Readonly<Partial<TrieCharacteristics>>;
}
