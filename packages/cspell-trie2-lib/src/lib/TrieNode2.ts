export const END_OF_WORD = '';

export interface TrieNode2 {
    /** id */
    i: number;
    /** string value */
    s: string;
    /** children */
    c?: TrieNode2[];
}
