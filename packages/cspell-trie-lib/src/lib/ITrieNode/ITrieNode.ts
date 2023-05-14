import type { TrieOptions } from './TrieOptions.js';

export interface ITrieNode {
    /** flag End of Word */
    readonly eow: boolean;
    /** number of children */
    readonly size: number;
    /** get keys to children */
    keys(): readonly string[];
    /** get keys to children */
    values(): readonly ITrieNode[];
    /** get child ITrieNode */
    get(char: string): ITrieNode | undefined;
    /** get a child by the key index */
    child(idx: number): ITrieNode;
    /** has child */
    has(char: string): boolean;
    /** `true` iff this node has children */
    hasChildren(): boolean;
}

export interface ITrieNodeRoot extends ITrieNode {
    options: Readonly<TrieOptions>;
}
