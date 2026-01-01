import type { TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { StringTable } from '../StringTable/StringTable.ts';

export interface TrieBlobInfo {
    readonly nodes: Uint32Array<ArrayBuffer>;
    readonly stringTable: StringTable;
    readonly info: Readonly<Partial<TrieInfo>>;
    readonly characteristics: Readonly<Partial<TrieCharacteristics>>;
}
