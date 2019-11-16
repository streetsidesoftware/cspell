export type END_OF_WORD = '';
export const END_OF_WORD: END_OF_WORD = '';

export type TrieNode2 = TrieNode2Root | TrieNode2Branch | TrieNode2EOW;

export interface TrieNode2Branch extends TrieNode2Root {
}

export interface TrieNode2Root {
    /** id */
    i: number;
    /** string value */
    s: string;
    /** children */
    c: TrieNode2[];
}

export interface TrieNode2EOW {
    /** id */
    i: 0;
    /** string value */
    s: END_OF_WORD;
}
