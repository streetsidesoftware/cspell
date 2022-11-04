export type END_OF_WORD = '\n';
export const END_OF_WORD: END_OF_WORD = '\n';

export type TrieNode2 = TrieNode2Root | TrieNode2Branch | TrieNode2EOW;

export type TrieNode2Branch = TrieNode2Root;

export interface TrieNode2Root {
    /** string value */
    s: string;
    /** children */
    c: TrieNode2[];
}

export interface TrieNode2EOW {
    /** string value */
    s: END_OF_WORD;
}
