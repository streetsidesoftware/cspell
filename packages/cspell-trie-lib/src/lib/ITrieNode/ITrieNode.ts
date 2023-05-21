import type { TrieOptions } from './TrieOptions.js';

export type ITrieNodeId = object | number | string;

type Entry = readonly [string, ITrieNode];

export interface ITrieNode {
    /**
     * ITrieNode instances are not unique. It is possible for multiple ITrieNode instances to
     * represent the same node.
     * `id` is used to see if two instances refer to the same node.
     * The type is obscured because it is up the the backing structure to provide the best value.
     * Note, only nodes from the same root are guaranteed to be unique. It is possible for two
     * different ITrieNode instances to have the same `id` value if they come from different roots.
     */
    readonly id: ITrieNodeId;
    /** flag End of Word */
    readonly eow: boolean;
    /** number of children */
    readonly size: number;
    /** get keys to children */
    keys(): readonly string[];
    /** get keys to children */
    values(): readonly ITrieNode[];
    /** get the children as key value pairs */
    entries(): readonly Entry[];
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
    /**
     * converts an `id` into a node.
     * @param id an of a ITrieNode in this Trie
     */
    resolveId(id: ITrieNodeId): ITrieNode;
}
