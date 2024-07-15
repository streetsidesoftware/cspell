import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { FastTrieBlobInternals } from './FastTrieBlobInternals.js';
import { Utf8Accumulator } from './Utf8.js';

const EmptyKeys: readonly string[] = Object.freeze([]);
const EmptyNodes: readonly ITrieNode[] = Object.freeze([]);
const EmptyEntries: readonly (readonly [string, ITrieNode])[] = Object.freeze([]);

type Node = readonly number[];
type NodeIndex = number;

class FastTrieBlobINode implements ITrieNode {
    readonly id: number;
    readonly node: Node;
    readonly eow: boolean;
    private _keys: readonly string[] | undefined;
    private _count: number;
    private _size: number | undefined;
    private _chained: boolean | undefined;
    private _nodesEntries: readonly [string, NodeIndex][] | undefined;
    private _entries: readonly [string, ITrieNode][] | undefined;
    private _values: readonly ITrieNode[] | undefined;
    protected charToIdx: Readonly<Record<string, NodeIndex>> | undefined;

    constructor(
        readonly trie: FastTrieBlobInternals,
        readonly nodeIdx: NodeIndex,
    ) {
        const node = trie.nodes[nodeIdx];
        this.node = node;
        this.eow = !!(node[0] & trie.NodeMaskEOW);
        this._count = node.length - 1;
        this.id = nodeIdx;
    }

    /** get keys to children */
    keys(): readonly string[] {
        if (this._keys) return this._keys;
        if (!this._count) return EmptyKeys;
        this._keys = this.getNodesEntries().map(([key]) => key);
        return this._keys;
    }

    values(): readonly ITrieNode[] {
        if (!this._count) return EmptyNodes;
        if (this._values) return this._values;
        this._values = this.entries().map(([, value]) => value);
        return this._values;
    }

    entries(): readonly (readonly [string, ITrieNode])[] {
        if (this._entries) return this._entries;
        if (!this._count) return EmptyEntries;
        const entries = this.getNodesEntries();
        this._entries = entries.map(([key, value]) => [key, new FastTrieBlobINode(this.trie, value)]);
        return this._entries;
    }

    /** get child ITrieNode */
    get(char: string): ITrieNode | undefined {
        const idx = this.getCharToIdxMap()[char];
        if (idx === undefined) return undefined;
        return this.child(idx);
    }

    has(char: string): boolean {
        const idx = this.getCharToIdxMap()[char];
        return idx !== undefined;
    }

    hasChildren(): boolean {
        return this._count > 0;
    }

    child(keyIdx: number): ITrieNode {
        if (!this._values && !this.containsChainedIndexes()) {
            const n = this.node[keyIdx + 1];
            const nodeIdx = n >>> this.trie.NodeChildRefShift;
            return new FastTrieBlobINode(this.trie, nodeIdx);
        }
        return this.values()[keyIdx];
    }

    getCharToIdxMap(): Record<string, number> {
        const m = this.charToIdx;
        if (m) return m;
        const map: Record<string, number> = Object.create(null);
        const keys = this.keys();
        for (let i = 0; i < keys.length; ++i) {
            map[keys[i]] = i;
        }
        this.charToIdx = map;
        return map;
    }

    private containsChainedIndexes(): boolean {
        if (this._chained !== undefined) return this._chained;
        if (!this._count || !this.trie.isIndexDecoderNeeded) {
            this._chained = false;
            return false;
        }
        // scan the node to see if there are encoded entries.
        let found = false;
        const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
        const len = this._count;
        const node = this.node;
        for (let i = 1; i <= len && !found; ++i) {
            const entry = node[i];
            const codePoint = entry & NodeMaskChildCharIndex;
            found = Utf8Accumulator.isMultiByte(codePoint);
        }

        this._chained = !!found;
        return this._chained;
    }

    private getNodesEntries(): readonly [string, NodeIndex][] {
        if (this._nodesEntries) return this._nodesEntries;
        if (!this.containsChainedIndexes()) {
            const entries = Array<[string, NodeIndex]>(this._count);
            const nodes = this.node;
            const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
            const RefShift = this.trie.NodeChildRefShift;
            for (let i = 0; i < this._count; ++i) {
                const entry = nodes[i + 1];
                const codePoint = entry & NodeMaskChildCharIndex;
                entries[i] = [String.fromCodePoint(codePoint), entry >>> RefShift];
            }
            this._nodesEntries = entries;
            return entries;
        }

        this._nodesEntries = this.walkChainedIndexes();
        return this._nodesEntries;
    }

    private walkChainedIndexes(): readonly [string, NodeIndex][] {
        interface StackItem {
            /** the current node */
            n: Node;
            /** the offset of the child within the current node */
            c: number;
            /** the decoder */
            acc: Utf8Accumulator;
        }
        const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.trie.NodeChildRefShift;
        const nodes = this.trie.nodes;
        const acc = Utf8Accumulator.create();
        const stack: StackItem[] = [{ n: this.node, c: 1, acc }];
        let depth = 0;
        /** there is at least this._count number of entries, more if there are nested indexes. */
        const entries = Array<[string, NodeIndex]>(this._count);
        let eIdx = 0;

        while (depth >= 0) {
            const s = stack[depth];
            const { n: node, c: off } = s;
            if (off >= node.length) {
                --depth;
                continue;
            }
            ++s.c;
            const entry = node[off];
            const charIdx = entry & NodeMaskChildCharIndex;
            const acc = s.acc.clone();
            const codePoint = acc.decode(charIdx);
            if (codePoint !== undefined) {
                const char = String.fromCodePoint(codePoint);
                const nodeIdx = entry >>> NodeChildRefShift;
                entries[eIdx++] = [char, nodeIdx];
                continue;
            }
            const idx = entry >>> NodeChildRefShift;
            const ss = stack[++depth];
            if (ss) {
                ss.n = nodes[idx];
                ss.c = 1;
                ss.acc = acc;
            } else {
                stack[depth] = { n: nodes[idx], c: 1, acc };
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

export class FastTrieBlobIRoot extends FastTrieBlobINode implements ITrieNodeRoot {
    constructor(
        trie: FastTrieBlobInternals,
        nodeIdx: number,
        readonly info: Readonly<TrieInfo>,
    ) {
        super(trie, nodeIdx);
    }
    resolveId(id: ITrieNodeId): ITrieNode {
        return new FastTrieBlobINode(this.trie, id as number);
    }
}
