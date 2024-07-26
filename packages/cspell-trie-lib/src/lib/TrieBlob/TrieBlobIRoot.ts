import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { TrieInfo } from '../ITrieNode/TrieInfo.js';
import { CharIndex } from './CharIndex.js';
import { Utf8Accumulator } from './Utf8.js';

interface BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
}

type Node = number;
type NodeIndex = number;

interface TrieMethods {
    readonly nodeFindExact: (idx: number, word: string) => boolean;
    readonly nodeGetChild: (idx: number, letter: string) => number | undefined;
    readonly isForbidden: (word: string) => boolean;
    readonly findExact: (word: string) => boolean;
}

export class TrieBlobInternals implements TrieMethods, BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
    readonly isIndexDecoderNeeded: boolean;
    readonly nodeFindExact: (idx: number, word: string) => boolean;
    readonly isForbidden: (word: string) => boolean;
    readonly findExact: (word: string) => boolean;
    readonly nodeGetChild: (idx: number, letter: string) => number | undefined;

    constructor(
        readonly nodes: Uint32Array,
        readonly charIndex: Readonly<CharIndex>,
        maskInfo: BitMaskInfo,
        methods: TrieMethods,
    ) {
        const { NodeMaskEOW, NodeMaskChildCharIndex, NodeMaskNumChildren, NodeChildRefShift } = maskInfo;
        this.NodeMaskEOW = NodeMaskEOW;
        this.NodeMaskNumChildren = NodeMaskNumChildren;
        this.NodeMaskChildCharIndex = NodeMaskChildCharIndex;
        this.NodeChildRefShift = NodeChildRefShift;
        this.isIndexDecoderNeeded = charIndex.indexContainsMultiByteChars();
        this.nodeFindExact = methods.nodeFindExact;
        this.isForbidden = methods.isForbidden;
        this.findExact = methods.findExact;
        this.nodeGetChild = methods.nodeGetChild;
    }
}

const EmptyKeys: readonly string[] = Object.freeze([]);
const EmptyNodes: readonly ITrieNode[] = Object.freeze([]);
const EmptyEntries: readonly (readonly [string, ITrieNode])[] = Object.freeze([]);

export interface ITrieSupportMethods extends Readonly<Pick<ITrieNodeRoot, 'find'>> {}

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
        return this.#getChildNode(char);
    }

    has(char: string): boolean {
        return this.trie.nodeGetChild(this.nodeIdx, char) !== undefined;
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

    findExact(word: string): boolean {
        return this.trie.nodeFindExact(this.nodeIdx, word);
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
            found = Utf8Accumulator.isMultiByte(charIdx);
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

    private walkChainedIndexes(): readonly [string, number][] {
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
            const acc = s.acc.clone();
            const codePoint = acc.decode(charIdx);
            if (codePoint !== undefined) {
                const char = String.fromCodePoint(codePoint);
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
    find: ITrieNodeRoot['find'];
    isForbidden: ITrieNodeRoot['isForbidden'];

    constructor(
        trie: TrieBlobInternals,
        nodeIdx: number,
        readonly info: Readonly<TrieInfo>,
        methods: ITrieSupportMethods,
    ) {
        super(trie, nodeIdx);
        this.find = methods.find;
        this.isForbidden = trie.isForbidden;
    }
    resolveId(id: ITrieNodeId): ITrieNode {
        return new TrieBlobINode(this.trie, id as number);
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
