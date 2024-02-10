import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { FastTrieBlobInternals } from './FastTrieBlobInternals.js';

const EmptyKeys: readonly string[] = Object.freeze([]);
const EmptyNodes: readonly ITrieNode[] = Object.freeze([]);
class FastTrieBlobINode implements ITrieNode {
    readonly id: number;
    readonly size: number;
    readonly node: readonly number[];
    readonly eow: boolean;
    charToIdx: Record<string, number> | undefined;
    private _keys: readonly string[] | undefined;

    constructor(
        readonly trie: FastTrieBlobInternals,
        readonly nodeIdx: number,
    ) {
        const node = trie.nodes[nodeIdx];
        this.node = node;
        const value = node[0];
        this.eow = !!(value & trie.NodeMaskEOW);
        this.size = node.length - 1;
        this.id = nodeIdx;
    }

    keys() {
        return (this._keys ??= this.calcKeys());
    }

    /** get keys to children */
    private calcKeys(): readonly string[] {
        if (!this.size) return EmptyKeys;
        const NodeMaskChildCharIndex = this.trie.NodeMaskChildCharIndex;
        const charIndex = this.trie.charIndex;
        const keys = Array<string>(this.size);
        const len = this.size;
        const node = this.trie.nodes[this.nodeIdx];
        for (let i = 0; i < len; ++i) {
            const entry = node[i + 1];
            const charIdx = entry & NodeMaskChildCharIndex;
            keys[i] = charIndex[charIdx];
        }
        return Object.freeze(keys);
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
        const node = this.trie.nodes[this.nodeIdx];
        const nodeIdx = node[keyIdx + 1] >>> this.trie.NodeChildRefShift;
        return new FastTrieBlobINode(this.trie, nodeIdx);
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
