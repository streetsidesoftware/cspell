import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { TrieInfo } from '../ITrieNode/TrieInfo.js';
import {
    NumberSequenceByteDecoderAccumulator,
    NumberSequenceByteEncoderDecoder,
} from './NumberSequenceByteDecoderAccumulator.js';

interface BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
}

const SpecialCharIndexMask = NumberSequenceByteEncoderDecoder.SpecialCharIndexMask;

type Node = number;
type NodeIndex = number;

export class TrieBlobInternals implements BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
    readonly isIndexDecoderNeeded: boolean;

    constructor(
        readonly nodes: Uint32Array,
        readonly charIndex: readonly string[],
        maskInfo: BitMaskInfo,
    ) {
        const { NodeMaskEOW, NodeMaskChildCharIndex, NodeMaskNumChildren, NodeChildRefShift } = maskInfo;
        this.NodeMaskEOW = NodeMaskEOW;
        this.NodeMaskNumChildren = NodeMaskNumChildren;
        this.NodeMaskChildCharIndex = NodeMaskChildCharIndex;
        this.NodeChildRefShift = NodeChildRefShift;
        this.isIndexDecoderNeeded = charIndex.length > NumberSequenceByteEncoderDecoder.MaxCharIndex;
    }
}

const EmptyKeys: readonly string[] = Object.freeze([]);
const EmptyNodes: readonly ITrieNode[] = Object.freeze([]);
const EmptyEntries: readonly (readonly [string, ITrieNode])[] = Object.freeze([]);

class TrieBlobINode implements ITrieNode {
    readonly id: number;
    readonly node: Node;
    readonly eow: boolean;
    private _keys: readonly string[] | undefined;
    private _count: number;
    private _size: number | undefined;
    private _chained: boolean | undefined;
    private _nodesEntries: readonly [string, number][] | undefined;
    private _entries: readonly [string, ITrieNode][] | undefined;
    private _values: readonly ITrieNode[] | undefined;
    protected charToIdx: Readonly<Record<string, number>> | undefined;

    constructor(
        readonly trie: TrieBlobInternals,
        readonly nodeIdx: NodeIndex,
    ) {
        const node = trie.nodes[nodeIdx];
        this.node = node;
        this.eow = !!(node & trie.NodeMaskEOW);
        this._count = node & trie.NodeMaskNumChildren;
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
        this._entries = entries.map(([key, value]) => [key, new TrieBlobINode(this.trie, value)]);
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
            const n = this.trie.nodes[this.nodeIdx + keyIdx + 1];
            const nodeIdx = n >>> this.trie.NodeChildRefShift;
            return new TrieBlobINode(this.trie, nodeIdx);
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
        const offset = this.nodeIdx + 1;
        const nodes = this.trie.nodes;
        const len = this._count;
        for (let i = 0; i < len && !found; ++i) {
            const entry = nodes[i + offset];
            const charIdx = entry & NodeMaskChildCharIndex;
            found = (charIdx & SpecialCharIndexMask) === SpecialCharIndexMask;
        }

        this._chained = !!found;
        return this._chained;
    }

    private getNodesEntries(): readonly [string, number][] {
        if (this._nodesEntries) return this._nodesEntries;
        if (!this.containsChainedIndexes()) {
            const entries = Array<[string, number]>(this._count);
            const nodes = this.trie.nodes;
            const offset = this.nodeIdx + 1;
            const charIndex = this.trie.charIndex;
            const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
            const RefShift = this.trie.NodeChildRefShift;
            for (let i = 0; i < this._count; ++i) {
                const entry = nodes[offset + i];
                const charIdx = entry & NodeMaskChildCharIndex;
                entries[i] = [charIndex[charIdx], entry >>> RefShift];
            }
            this._nodesEntries = entries;
            return entries;
        }

        this._nodesEntries = this.walkChainedIndexes();
        return this._nodesEntries;
    }

    private walkChainedIndexes(): readonly [string, number][] {
        interface StackItem {
            nodeIdx: number;
            lastIdx: number;
            acc: NumberSequenceByteDecoderAccumulator;
        }
        const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.trie.NodeChildRefShift;
        const NodeMaskNumChildren = this.trie.NodeMaskNumChildren;
        const nodes = this.trie.nodes;
        const acc = NumberSequenceByteDecoderAccumulator.create();
        const stack: StackItem[] = [{ nodeIdx: this.nodeIdx + 1, lastIdx: this.nodeIdx + this._count, acc }];
        let depth = 0;
        const entries = Array<[string, number]>(this._count);
        let eIdx = 0;
        const charIndex = this.trie.charIndex;

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
            const acc = s.acc.clone();
            const letterIdx = acc.decode(charIdx);
            if (letterIdx !== undefined) {
                const char = charIndex[letterIdx];
                const nodeIdx = entry >>> NodeChildRefShift;
                entries[eIdx++] = [char, nodeIdx];
                continue;
            }
            const idx = entry >>> NodeChildRefShift;
            const lIdx = idx + (nodes[idx] & NodeMaskNumChildren);
            const ss = stack[++depth];
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
    constructor(
        trie: TrieBlobInternals,
        nodeIdx: number,
        readonly info: Readonly<TrieInfo>,
    ) {
        super(trie, nodeIdx);
    }
    resolveId(id: ITrieNodeId): ITrieNode {
        return new TrieBlobINode(this.trie, id as number);
    }
}
