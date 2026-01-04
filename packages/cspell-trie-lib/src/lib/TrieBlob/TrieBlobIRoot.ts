import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import type { TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { ITrieBlobIMethods, NodeRef } from './TrieBlobIMethods.ts';
import { trieBlobNodeRefToITrieNodeId } from './TrieBlobNodeRef.ts';

const EMPTY_KEYS: readonly string[] = Object.freeze([]);
const EMPTY_NODES: readonly ITrieNode[] = Object.freeze([]);
const EMPTY_ENTRIES: readonly (readonly [string, ITrieNode])[] = Object.freeze([]);

/**
 * Index to a child of the node.
 *
 * It can be the index into:
 * - ITrieNode.keys()
 * - ITrieNode.values()
 * - ITrieNode.entries()
 */
type KeyIndex = number;

class TrieBlobINode implements ITrieNode {
    readonly id: ITrieNodeId;
    readonly node: NodeRef;
    readonly eow: boolean;
    private _keys: readonly string[] | undefined;
    private _hasChildren: boolean | undefined;
    private _size: number | undefined;
    private _nodesEntries: (readonly [string, NodeRef])[] | undefined;
    private _entries: readonly [string, ITrieNode][] | undefined;
    private _values: readonly ITrieNode[] | undefined;
    protected charToIdx: Readonly<Record<string, KeyIndex>> | undefined;
    readonly trie: ITrieBlobIMethods;

    constructor(trie: ITrieBlobIMethods, node: NodeRef) {
        this.trie = trie;
        this.node = node;
        this.eow = trie.isEow(node);
        this.id = trieBlobNodeRefToITrieNodeId(node);
    }

    /** get keys to children */
    keys(): readonly string[] {
        if (this._keys) return this._keys;
        if (!this.hasChildren) return EMPTY_KEYS;
        this._keys = this.getNodesEntries().map(([key]) => key);
        return this._keys;
    }

    values(): readonly ITrieNode[] {
        if (!this.hasChildren) return EMPTY_NODES;
        if (this._values) return this._values;
        this._values = this.entries().map(([, value]) => value);
        return this._values;
    }

    valueAt(keyIdx: number): ITrieNode {
        if (this._values) return this._values[keyIdx];
        return this.entryAt(keyIdx)[1];
    }

    entries(): readonly (readonly [string, ITrieNode])[] {
        if (this._entries) return this._entries;
        if (!this.hasChildren) return EMPTY_ENTRIES;
        const entries = this.getNodesEntries();
        this._entries = entries.map(([key, value]) => [key, new TrieBlobINode(this.trie, value)]);
        return this._entries;
    }

    entryAt(keyIdx: KeyIndex): readonly [string, ITrieNode] {
        if (this._entries) return this._entries[keyIdx];
        return this.entries()[keyIdx];
    }

    /** get child ITrieNode */
    get(char: string): ITrieNode | undefined {
        return this.#getChildNode(char);
    }

    has(char: string): boolean {
        return this.trie.nodeGetChild(this.node, char) !== undefined;
    }

    hasChildren(): boolean {
        return (this._hasChildren ??= this.trie.hasChildren(this.node));
    }

    child(keyIdx: KeyIndex): ITrieNode {
        return this.valueAt(keyIdx);
    }

    #getChildNodeRef(char: string) {
        return this.trie.nodeGetChild(this.node, char);
    }

    #getChildNode(char: string): ITrieNode | undefined {
        if (this.charToIdx) {
            const keyIdx = this.charToIdx[char];
            if (keyIdx === undefined) return undefined;
            return this.child(keyIdx);
        }
        const idx = this.#getChildNodeRef(char);
        if (idx === undefined) return undefined;
        return new TrieBlobINode(this.trie, idx);
    }

    getNode(word: string): ITrieNode | undefined {
        const n = this.trie.nodeFindNode(this.node, word);
        return n === undefined ? undefined : new TrieBlobINode(this.trie, n);
    }

    findExact(word: string): boolean {
        return this.trie.nodeFindExact(this.node, word);
    }

    private getNodesEntries(): readonly (readonly [string, NodeRef])[] {
        return (this._nodesEntries ??= this.trie.getChildEntries(this.node));
    }

    get size(): number {
        return (this._size ??= this.getNodesEntries().length);
    }
}

export class TrieBlobIRoot extends TrieBlobINode implements ITrieNodeRoot {
    find: ITrieNodeRoot['find'];
    isForbidden: ITrieNodeRoot['isForbidden'];

    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;
    readonly info: Readonly<TrieInfo>;

    constructor(trie: Readonly<ITrieBlobIMethods>, nodeIdx: NodeRef) {
        super(trie, nodeIdx);
        this.info = trie.info;
        this.find = trie.find;
        this.isForbidden = trie.isForbidden;
        this.hasForbiddenWords = trie.hasForbiddenWords;
        this.hasCompoundWords = trie.hasCompoundWords;
        this.hasNonStrictWords = trie.hasNonStrictWords;
    }

    resolveId(id: ITrieNodeId): ITrieNode {
        return new TrieBlobINode(this.trie, this.trie.fromITrieNodeId(id));
    }

    get forbidPrefix(): string {
        return this.info.forbiddenWordPrefix;
    }

    get compoundFix(): string {
        return this.info.compoundCharacter;
    }

    get caseInsensitivePrefix(): string {
        return this.info.stripCaseAndAccentsPrefix;
    }
}
