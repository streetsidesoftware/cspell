import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import type { TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { ITrieBlobIMethods, NodeRef } from './TrieBlobIMethods.ts';
import { Utf8Accumulator } from './Utf8.ts';

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
    private _count: number;
    private _size: number | undefined;
    private _chained: boolean | undefined;
    private _nodesEntries: readonly [string, NodeRef][] | undefined;
    private _entries: readonly [string, ITrieNode][] | undefined;
    private _values: readonly ITrieNode[] | undefined;
    protected charToIdx: Readonly<Record<string, KeyIndex>> | undefined;
    readonly trie: ITrieBlobIMethods;
    readonly nodeIdx: NodeRef;

    constructor(trie: ITrieBlobIMethods, nodeIdx: NodeRef) {
        this.trie = trie;
        this.nodeIdx = nodeIdx;
        const node = trie.nodes[nodeIdx];
        this.node = node;
        this.eow = !!(node & trie.NodeMaskEOW);
        this._count = node & trie.NodeMaskNumChildren;
        this.id = nodeIdx;
    }

    /** get keys to children */
    keys(): readonly string[] {
        if (this._keys) return this._keys;
        if (!this._count) return EMPTY_KEYS;
        this._keys = this.getNodesEntries().map(([key]) => key);
        return this._keys;
    }

    values(): readonly ITrieNode[] {
        if (!this._count) return EMPTY_NODES;
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
        if (!this._count) return EMPTY_ENTRIES;
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
        return this.trie.nodeGetChild(this.nodeIdx, char) !== undefined;
    }

    hasChildren(): boolean {
        return this._count > 0;
    }

    child(keyIdx: KeyIndex): ITrieNode {
        if (!this._values && !this.containsChainedIndexes()) {
            const n = this.trie.nodes[this.nodeIdx + keyIdx + 1];
            const nodeIdx = n >>> this.trie.NodeChildRefShift;
            return new TrieBlobINode(this.trie, nodeIdx);
        }
        return this.valueAt(keyIdx);
    }

    #getChildNodeIdx(char: string) {
        return this.trie.nodeGetChild(this.nodeIdx, char);
    }

    #getChildNode(char: string): ITrieNode | undefined {
        if (this.charToIdx) {
            const keyIdx = this.charToIdx[char];
            if (keyIdx === undefined) return undefined;
            return this.child(keyIdx);
        }
        const idx = this.#getChildNodeIdx(char);
        if (idx === undefined) return undefined;
        return new TrieBlobINode(this.trie, idx);
    }

    getNode(word: string): ITrieNode | undefined {
        const n = this.trie.nodeFindNode(this.nodeIdx, word);
        return n === undefined ? undefined : new TrieBlobINode(this.trie, n);
    }

    findExact(word: string): boolean {
        return this.trie.nodeFindExact(this.nodeIdx, word);
    }

    private containsChainedIndexes(): boolean {
        if (this._chained !== undefined) return this._chained;
        // scan the node to see if there are encoded entries.
        let found = false;
        const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
        const offset = this.nodeIdx + 1;
        const nodes = this.trie.nodes;
        const len = this._count;
        for (let i = 0; i < len && !found; ++i) {
            const entry = nodes[i + offset];
            const charIdx = entry & NodeMaskChildCharIndex;
            found = Utf8Accumulator.isMultiByte(charIdx);
        }

        this._chained = found;
        return this._chained;
    }

    private getNodesEntries(): readonly [string, NodeRef][] {
        if (this._nodesEntries) return this._nodesEntries;
        if (!this.containsChainedIndexes()) {
            const entries = Array<[string, number]>(this._count);
            const nodes = this.trie.nodes;
            const offset = this.nodeIdx + 1;
            const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
            const RefShift = this.trie.NodeChildRefShift;
            for (let i = 0; i < this._count; ++i) {
                const entry = nodes[offset + i];
                const codePoint = entry & NodeMaskChildCharIndex;
                entries[i] = [String.fromCodePoint(codePoint), entry >>> RefShift];
            }
            this._nodesEntries = entries;
            return entries;
        }

        this._nodesEntries = this.walkChainedIndexes();
        return this._nodesEntries;
    }

    private walkChainedIndexes(): readonly [string, NodeRef][] {
        interface StackItem {
            nodeIdx: number;
            lastIdx: number;
            acc: Utf8Accumulator;
        }
        const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.trie.NodeChildRefShift;
        const NodeMaskNumChildren = this.trie.NodeMaskNumChildren;
        const nodes = this.trie.nodes;
        const acc = Utf8Accumulator.create();
        const stack: StackItem[] = [{ nodeIdx: this.nodeIdx + 1, lastIdx: this.nodeIdx + this._count, acc }];
        let depth = 0;
        const entries = Array<[string, number]>(this._count);
        let eIdx = 0;

        while (depth >= 0) {
            const s = stack[depth];
            const { nodeIdx, lastIdx } = s;
            if (nodeIdx > lastIdx) {
                --depth;
                continue;
            }
            ++s.nodeIdx;
            const entry = nodes[nodeIdx];
            const charIdx = entry & NodeMaskChildCharIndex;
            const ss = stack[depth + 1];
            const acc = s.acc.clone(ss?.acc);
            const codePoint = acc.decode(charIdx);
            if (codePoint !== undefined) {
                const char = String.fromCodePoint(codePoint);
                const nodeIdx = entry >>> NodeChildRefShift;
                entries[eIdx++] = [char, nodeIdx];
                continue;
            }
            const idx = entry >>> NodeChildRefShift;
            const lIdx = idx + (nodes[idx] & NodeMaskNumChildren);
            depth++;
            if (ss) {
                ss.nodeIdx = idx + 1;
                ss.lastIdx = lIdx;
                ss.acc = acc;
            } else {
                stack[depth] = { nodeIdx: idx + 1, lastIdx: lIdx, acc };
            }
        }

        return entries;
    }

    get size(): number {
        if (this._size === undefined) {
            if (!this.containsChainedIndexes()) {
                this._size = this._count;
                return this._size;
            }
            this._size = this.getNodesEntries().length;
        }
        return this._size;
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
