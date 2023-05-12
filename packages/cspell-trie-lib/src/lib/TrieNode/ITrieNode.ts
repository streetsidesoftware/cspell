import type { TrieOptions } from './TrieNode.js';

export interface ITrieNode {
    /** flag End of Word */
    readonly eow: boolean;
    /** number of children */
    readonly size: number;
    /** get keys to children */
    getKeys(): readonly string[];
    /** get child ITrieNode */
    get(char: string): ITrieNode | undefined;
    /** get a child by the key index */
    child(idx: number): ITrieNode | undefined;
    /** has child */
    has(char: string): boolean;
}

export interface ITrieNodeRoot extends ITrieNode {
    options: Readonly<TrieOptions>;
}
