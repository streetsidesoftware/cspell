import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { TrieOptions } from '../ITrieNode/TrieOptions.js';

interface BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
}

export class TrieBlobInternals implements BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;

    constructor(
        readonly nodes: Uint32Array,
        readonly charIndex: string[],
        readonly charToIndexMap: Readonly<Record<string, number>>,
        maskInfo: BitMaskInfo
    ) {
        const { NodeMaskEOW, NodeMaskChildCharIndex, NodeMaskNumChildren, NodeChildRefShift } = maskInfo;
        this.NodeMaskEOW = NodeMaskEOW;
        this.NodeMaskNumChildren = NodeMaskNumChildren;
        this.NodeMaskChildCharIndex = NodeMaskChildCharIndex;
        this.NodeChildRefShift = NodeChildRefShift;
    }
}
const EmptyKeys: readonly string[] = Object.freeze([]);
const EmptyNodes: readonly ITrieNode[] = Object.freeze([]);
class TrieBlobINode implements ITrieNode {
    readonly id: number;
    readonly size: number;
    readonly node: number;
    readonly eow: boolean;
    private _keys: string[] | undefined;
    charToIdx: Record<string, number> | undefined;

    constructor(readonly trie: TrieBlobInternals, readonly nodeIdx: number) {
        const node = trie.nodes[nodeIdx];
        this.node = node;
        this.eow = !!(node & trie.NodeMaskEOW);
        this.size = node & trie.NodeMaskNumChildren;
        this.id = nodeIdx;
    }

    /** get keys to children */
    keys(): readonly string[] {
        if (this._keys) return this._keys;
        if (!this.size) return EmptyKeys;
        const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
        const charIndex = this.trie.charIndex;
        const keys = Array<string>(this.size);
        const offset = this.nodeIdx + 1;
        const len = this.size;
        for (let i = 0; i < len; ++i) {
            const entry = this.trie.nodes[i + offset];
            const charIdx = entry & NodeMaskChildCharIndex;
            keys[i] = charIndex[charIdx];
        }
        this._keys = keys;
        return keys;
    }

    values(): readonly ITrieNode[] {
        if (!this.size) return EmptyNodes;
        const nodes = Array(this.size);
        for (let i = 0; i < this.size; ++i) {
            nodes[i] = this.child(i);
        }
        return nodes;
    }

    entries(): readonly (readonly [string, ITrieNode])[] {
        const keys = this.keys();
        const values = this.values();
        const len = keys.length;
        const entries: (readonly [string, ITrieNode])[] = Array(len);
        for (let i = 0; i < len; ++i) {
            entries[i] = [keys[i], values[i]] as const;
        }
        return entries;
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
        return this.size > 0;
    }

    child(keyIdx: number): ITrieNode {
        const n = this.trie.nodes[this.nodeIdx + keyIdx + 1];
        const nodeIdx = n >>> this.trie.NodeChildRefShift;
        return new TrieBlobINode(this.trie, nodeIdx);
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
}
export class TrieBlobIRoot extends TrieBlobINode implements ITrieNodeRoot {
    constructor(trie: TrieBlobInternals, nodeIdx: number, readonly options: Readonly<TrieOptions>) {
        super(trie, nodeIdx);
    }
    resolveId(id: ITrieNodeId): ITrieNode {
        return new TrieBlobINode(this.trie, id as number);
    }
}
