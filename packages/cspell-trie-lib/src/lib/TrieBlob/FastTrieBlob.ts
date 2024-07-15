import type { ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import { findNode } from '../ITrieNode/trie-util.js';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieData } from '../TrieData.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import { CharIndex, Utf8Seq } from './CharIndex.js';
import { extractInfo, type FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';
import { assertSorted, FastTrieBlobInternals, sortNodes } from './FastTrieBlobInternals.js';
import { FastTrieBlobIRoot } from './FastTrieBlobIRoot.js';
import { TrieBlob } from './TrieBlob.js';
import { Utf8Accumulator } from './Utf8.js';

type FastTrieBlobNode = number[];

const useSorted = true;
const checkSorted = false;

export class FastTrieBlob implements TrieData {
    private _readonly = false;
    private _forbidIdx: number;
    private _iTrieRoot: ITrieNodeRoot | undefined;
    wordToCharacters: (word: string) => readonly string[];

    readonly info: Readonly<TrieInfo>;

    private constructor(
        private nodes: FastTrieBlobNode[],
        private _charIndex: CharIndex,
        readonly bitMasksInfo: FastTrieBlobBitMaskInfo,
        readonly sorted: boolean,
        options?: PartialTrieInfo,
    ) {
        this.info = mergeOptionalWithDefaults(options);
        this.wordToCharacters = (word: string) => [...word];
        this._forbidIdx = this._searchNodeForChar(0, this.info.forbiddenWordPrefix);
        if (sorted && checkSorted) {
            assertSorted(nodes, bitMasksInfo.NodeMaskChildCharIndex);
        }
    }

    public wordToNodeCharIndexSequence(word: string): Utf8Seq {
        return this._charIndex.wordToUtf8Seq(word);
    }

    private letterToNodeCharIndexSequence(letter: string): Utf8Seq {
        return this._charIndex.getCharUtf8Seq(letter);
    }

    has(word: string): boolean {
        return this._has(0, word);
    }

    private _has(nodeIdx: number, word: string): boolean {
        return this.sorted && useSorted ? this.#hasSorted(nodeIdx, word) : this.#has(nodeIdx, word);
    }

    #has(nodeIdx: number, word: string): boolean {
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const NodeMaskEOW = this.bitMasksInfo.NodeMaskEOW;
        const nodes = this.nodes;
        const charIndexes = this.wordToNodeCharIndexSequence(word);
        const len = charIndexes.length;
        let node = nodes[nodeIdx];
        for (let p = 0; p < len; ++p, node = nodes[nodeIdx]) {
            const letterIdx = charIndexes[p];
            const count = node.length;
            let i = count - 1;
            for (; i > 0; --i) {
                if ((node[i] & NodeMaskChildCharIndex) === letterIdx) {
                    break;
                }
            }
            if (i < 1) return false;
            nodeIdx = node[i] >>> NodeChildRefShift;
            if (!nodeIdx) return false;
        }

        return !!(node[0] & NodeMaskEOW);
    }

    #hasSorted(nodeIdx: number, word: string): boolean {
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const NodeMaskEOW = this.bitMasksInfo.NodeMaskEOW;
        const nodes = this.nodes;
        const charIndexes = this.wordToNodeCharIndexSequence(word);
        const len = charIndexes.length;
        let node = nodes[nodeIdx];
        for (let p = 0; p < len; ++p, node = nodes[nodeIdx]) {
            const letterIdx = charIndexes[p];
            const count = node.length;
            // console.error('%o', { p, letterIdx, ...this.nodeInfo(nodeIdx) });
            if (count < 2) return false;
            let i = 1;
            let j = count - 1;
            let c: number = -1;
            while (i < j) {
                const m = (i + j) >> 1;
                c = node[m] & NodeMaskChildCharIndex;
                if (c < letterIdx) {
                    i = m + 1;
                } else {
                    j = m;
                }
            }
            if (i >= count || (node[i] & NodeMaskChildCharIndex) !== letterIdx) return false;
            nodeIdx = node[i] >>> NodeChildRefShift;
            if (!nodeIdx) return false;
        }

        return !!(node[0] & NodeMaskEOW);
    }

    *words(): Iterable<string> {
        interface StackItem {
            nodeIdx: number;
            pos: number;
            word: string;
            accumulator: Utf8Accumulator;
        }
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const NodeMaskEOW = this.bitMasksInfo.NodeMaskEOW;
        const nodes = this.nodes;
        const accumulator = Utf8Accumulator.create();
        const stack: StackItem[] = [{ nodeIdx: 0, pos: 0, word: '', accumulator }];
        let depth = 0;

        while (depth >= 0) {
            const { nodeIdx, pos, word, accumulator } = stack[depth];
            const node = nodes[nodeIdx];

            if (!pos && node[0] & NodeMaskEOW) {
                yield word;
            }
            if (pos >= node.length - 1) {
                --depth;
                continue;
            }
            const nextPos = ++stack[depth].pos;
            const entry = node[nextPos];
            const charIdx = entry & NodeMaskChildCharIndex;
            const acc = accumulator.clone();
            const codePoint = acc.decode(charIdx);
            const letter = (codePoint && String.fromCodePoint(codePoint)) || '';
            ++depth;
            stack[depth] = {
                nodeIdx: entry >>> NodeChildRefShift,
                pos: 0,
                word: word + letter,
                accumulator: acc,
            };
        }
    }

    toTrieBlob(): TrieBlob {
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const nodes = this.nodes;
        function calcNodeToIndex(nodes: number[][]): number[] {
            let offset = 0;
            const idx: number[] = Array(nodes.length + 1);
            for (let i = 0; i < nodes.length; ++i) {
                idx[i] = offset;
                offset += nodes[i].length;
            }
            idx[nodes.length] = offset;
            return idx;
        }

        const nodeToIndex = calcNodeToIndex(nodes);
        const nodeElementCount = nodeToIndex[nodeToIndex.length - 1];
        const binNodes = new Uint32Array(nodeElementCount);
        const lenShift = TrieBlob.NodeMaskNumChildrenShift;
        const refShift = TrieBlob.NodeChildRefShift;

        let offset = 0;
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            // assert(offset === nodeToIndex[i]);
            binNodes[offset++] = ((node.length - 1) << lenShift) | node[0];
            for (let j = 1; j < node.length; ++j) {
                const v = node[j];
                const nodeRef = v >>> NodeChildRefShift;
                const charIndex = v & NodeMaskChildCharIndex;
                binNodes[offset++] = (nodeToIndex[nodeRef] << refShift) | charIndex;
            }
        }

        return new TrieBlob(binNodes, this._charIndex, this.info);
    }

    isReadonly(): boolean {
        return this._readonly;
    }

    freeze(): this {
        this._readonly = true;
        return this;
    }

    toJSON() {
        return {
            info: this.info,
            nodes: nodesToJSON(this.nodes),
            // charIndex: this._charIndex,
        };
    }

    static create(data: FastTrieBlobInternals, options?: PartialTrieInfo) {
        return new FastTrieBlob(data.nodes, data.charIndex, extractInfo(data), data.sorted, options);
    }

    static toITrieNodeRoot(trie: FastTrieBlob): ITrieNodeRoot {
        return new FastTrieBlobIRoot(
            new FastTrieBlobInternals(trie.nodes, trie._charIndex, trie.bitMasksInfo, trie.sorted),
            0,
            trie.info,
        );
    }

    static NodeMaskEOW = TrieBlob.NodeMaskEOW;
    static NodeChildRefShift = TrieBlob.NodeChildRefShift;
    static NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;

    static DefaultBitMaskInfo: FastTrieBlobBitMaskInfo = {
        NodeMaskEOW: FastTrieBlob.NodeMaskEOW,
        NodeMaskChildCharIndex: FastTrieBlob.NodeMaskChildCharIndex,
        NodeChildRefShift: FastTrieBlob.NodeChildRefShift,
    };

    get iTrieRoot(): ITrieNodeRoot {
        return (this._iTrieRoot ??= FastTrieBlob.toITrieNodeRoot(this));
    }

    getRoot(): ITrieNodeRoot {
        return this.iTrieRoot;
    }

    getNode(prefix: string): ITrieNode | undefined {
        return findNode(this.getRoot(), prefix);
    }

    isForbiddenWord(word: string): boolean {
        return !!this._forbidIdx && this._has(this._forbidIdx, word);
    }

    hasForbiddenWords(): boolean {
        return !!this._forbidIdx;
    }

    nodeInfo(nodeIndex: number, accumulator?: Utf8Accumulator): TrieBlobNodeInfo {
        const acc = accumulator ?? Utf8Accumulator.create();
        const n = this.nodes[nodeIndex];
        const eow = !!(n[0] & this.bitMasksInfo.NodeMaskEOW);
        const children = n.slice(1).map((v) => {
            const cIdx = v & this.bitMasksInfo.NodeMaskChildCharIndex;
            const a = acc.clone();
            const codePoint = a.decode(cIdx);
            const c = codePoint !== undefined ? String.fromCodePoint(codePoint) : '∎';
            const i = v >>> this.bitMasksInfo.NodeChildRefShift;
            return { c, i, cIdx };
        });
        return { eow, children };
    }

    /** number of nodes */
    get size() {
        return this.nodes.length;
    }

    private _lookupCharIndexNode(nodeIdx: number, charIndex: number): number {
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const nodes = this.nodes;
        const node = nodes[nodeIdx];
        const letterIdx = charIndex;
        const count = node.length;
        let i = count - 1;
        for (; i > 0; --i) {
            if ((node[i] & NodeMaskChildCharIndex) === letterIdx) {
                return node[i] >>> NodeChildRefShift;
            }
        }
        return 0;
    }

    /** Search from nodeIdx for the node index representing the character. */
    private _searchNodeForChar(nodeIdx: number, char: string): number {
        const charIndexes = this.letterToNodeCharIndexSequence(char);
        let idx = nodeIdx;
        for (let i = 0; i < charIndexes.length; ++i) {
            idx = this._lookupCharIndexNode(idx, charIndexes[i]);
            if (!idx) return 0;
        }
        return idx;
    }

    get charIndex(): readonly string[] {
        return [...this._charIndex.charIndex];
    }

    static fromTrieBlob(trie: TrieBlob): FastTrieBlob {
        const bitMasksInfo: FastTrieBlobBitMaskInfo = {
            NodeMaskEOW: TrieBlob.NodeMaskEOW,
            NodeMaskChildCharIndex: TrieBlob.NodeMaskChildCharIndex,
            NodeChildRefShift: TrieBlob.NodeChildRefShift,
        };
        const trieNodesBin = TrieBlob.nodesView(trie);
        const nodeOffsets: number[] = [];
        for (
            let offset = 0;
            offset < trieNodesBin.length;
            offset += (trieNodesBin[offset] & TrieBlob.NodeMaskNumChildren) + 1
        ) {
            nodeOffsets.push(offset);
        }
        const offsetToNodeIndex = new Map<number, number>(nodeOffsets.map((offset, i) => [offset, i]));
        const nodes: FastTrieBlobNode[] = Array.from({ length: nodeOffsets.length });
        for (let i = 0; i < nodes.length; ++i) {
            const offset = nodeOffsets[i];
            const n = trieNodesBin[offset];
            const eow = n & TrieBlob.NodeMaskEOW;
            const count = n & TrieBlob.NodeMaskNumChildren;
            // Preallocate the array to the correct size.
            const node = Array.from<number>({ length: count + 1 });
            node[0] = eow;
            nodes[i] = node;
            for (let j = 1; j <= count; ++j) {
                const n = trieNodesBin[offset + j];
                const charIndex = n & TrieBlob.NodeMaskChildCharIndex;
                const nodeIndex = n >>> TrieBlob.NodeChildRefShift;
                const idx = offsetToNodeIndex.get(nodeIndex);
                if (idx === undefined) {
                    throw new Error(`Invalid node index ${nodeIndex}`);
                }
                node[j] = (idx << TrieBlob.NodeChildRefShift) | charIndex;
            }
        }
        return new FastTrieBlob(
            sortNodes(nodes, TrieBlob.NodeMaskChildCharIndex),
            trie.charIndex,
            bitMasksInfo,
            true,
            trie.info,
        );
    }

    static isFastTrieBlob(obj: unknown): obj is FastTrieBlob {
        return obj instanceof FastTrieBlob;
    }
}

interface TrieBlobNodeInfo {
    eow: boolean;
    children: { c: string; i: number; cIdx: number }[];
}

export function nodesToJSON(nodes: Readonly<FastTrieBlobNode[]>) {
    const mapNodeToAcc = new Map<FastTrieBlobNode, Utf8Accumulator>();

    function mapNode(node: FastTrieBlobNode, i: number) {
        if (node.length === 1) {
            return {
                i,
                w: (!!(node[0] & TrieBlob.NodeMaskEOW) && 1) || 0,
            };
        }

        const acc = mapNodeToAcc.get(node) || Utf8Accumulator.create();

        function mapChild(n: number) {
            const index = n >>> TrieBlob.NodeChildRefShift;
            const seq = n & TrieBlob.NodeMaskChildCharIndex;
            const cAcc = acc.clone();
            const codePoint = cAcc.decode(seq);
            if (codePoint === undefined) {
                mapNodeToAcc.set(nodes[index], cAcc);
            }
            return {
                i: index,
                c: codePoint && String.fromCodePoint(codePoint),
                s: seq.toString(16).padStart(2, '0'),
            };
        }

        return {
            i,
            w: (!!(node[0] & TrieBlob.NodeMaskEOW) && 1) || 0,
            c: node.slice(1).map(mapChild),
        };
    }

    return nodes.map((n, i) => mapNode(n, i));
}
