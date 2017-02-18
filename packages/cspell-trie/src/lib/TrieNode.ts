export const FLAG_WORD = 1;

export class ChildMap extends Map<string, TrieNode> {};
export interface TrieNode {
    f?: number; // flags
    c?: ChildMap;
}

