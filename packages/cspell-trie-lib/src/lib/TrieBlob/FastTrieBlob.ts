import type { ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import { findNode } from '../ITrieNode/trie-util.js';
import type { TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieData } from '../TrieData.js';
import { CharIndex, Utf8Seq } from './CharIndex.js';
import { extractInfo, type FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';
import {
    assertSorted,
    FastTrieBlobInternals,
    FastTrieBlobInternalsAndMethods,
    sortNodes,
} from './FastTrieBlobInternals.js';
import { FastTrieBlobIRoot } from './FastTrieBlobIRoot.js';
import { TrieBlob } from './TrieBlob.js';
import { Utf8Accumulator } from './Utf8.js';

type FastTrieBlobNode = Uint32Array;

const checkSorted = false;

export class FastTrieBlob implements TrieData {
    private _readonly = false;
    #forbidIdx: number;
    #compoundIdx: number;
    #nonStrictIdx: number;
    private _iTrieRoot: ITrieNodeRoot | undefined;
    wordToCharacters: (word: string) => readonly string[];
    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;

    private constructor(
        private nodes: FastTrieBlobNode[],
        private _charIndex: CharIndex,
        readonly bitMasksInfo: FastTrieBlobBitMaskInfo,
        readonly info: Readonly<TrieInfo>,
    ) {
        this.wordToCharacters = (word: string) => [...word];
        this.#forbidIdx = this.#searchNodeForChar(0, this.info.forbiddenWordPrefix) || 0;
        this.#compoundIdx = this.#searchNodeForChar(0, this.info.compoundCharacter) || 0;
        this.#nonStrictIdx = this.#searchNodeForChar(0, this.info.stripCaseAndAccentsPrefix) || 0;

        this.hasForbiddenWords = !!this.#forbidIdx;
        this.hasCompoundWords = !!this.#compoundIdx;
        this.hasNonStrictWords = !!this.#nonStrictIdx;

        if (checkSorted) {
            assertSorted(this.nodes, bitMasksInfo.NodeMaskChildCharIndex);
        }
    }

    public wordToUtf8Seq(word: string): Utf8Seq {
        return this._charIndex.wordToUtf8Seq(word);
    }

    private letterToUtf8Seq(letter: string): Utf8Seq {
        return this._charIndex.getCharUtf8Seq(letter);
    }

    has(word: string): boolean {
        return this.#has(0, word);
    }

    hasCaseInsensitive(word: string): boolean {
        if (!this.#nonStrictIdx) return false;
        return this.#has(this.#nonStrictIdx, word);
    }

    #has(nodeIdx: number, word: string): boolean {
        return this.#hasSorted(nodeIdx, word);
    }

    #hasSorted(nodeIdx: number, word: string): boolean {
        const charIndexes = this.wordToUtf8Seq(word);
        const found = this.#lookupNode(nodeIdx, charIndexes);
        if (found === undefined) return false;
        const node = this.nodes[found];
        return !!(node[0] & this.bitMasksInfo.NodeMaskEOW);
    }

    /**
     * Find the node index for the given Utf8 character sequence.
     * @param nodeIdx - node index to start the search
     * @param seq - the byte sequence of the character to look for
     * @returns
     */
    #lookupNode(nodeIdx: number, seq: readonly number[] | Readonly<Uint8Array>): number | undefined {
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const nodes = this.nodes;
        const len = seq.length;
        let node = nodes[nodeIdx];
        for (let p = 0; p < len; ++p, node = nodes[nodeIdx]) {
            const letterIdx = seq[p];
            const count = node.length;
            // console.error('%o', { p, letterIdx, ...this.nodeInfo(nodeIdx) });
            if (count < 2) return undefined;
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
            if (i >= count || (node[i] & NodeMaskChildCharIndex) !== letterIdx) return undefined;
            nodeIdx = node[i] >>> NodeChildRefShift;
            if (!nodeIdx) return undefined;
        }

        return nodeIdx;
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
        function calcNodeToIndex(nodes: FastTrieBlobNode[]): number[] {
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

    static create(data: FastTrieBlobInternals) {
        return new FastTrieBlob(data.nodes, data.charIndex, extractInfo(data), data.info);
    }

    static toITrieNodeRoot(trie: FastTrieBlob): ITrieNodeRoot {
        return new FastTrieBlobIRoot(
            new FastTrieBlobInternalsAndMethods(trie.nodes, trie._charIndex, trie.bitMasksInfo, trie.info, {
                nodeFindNode: (idx: number, word: string) => trie.#lookupNode(idx, trie.wordToUtf8Seq(word)),
                nodeFindExact: (idx: number, word: string) => trie.#has(idx, word),
                nodeGetChild: (idx: number, letter: string) => trie.#searchNodeForChar(idx, letter),
                isForbidden: (word: string) => trie.isForbiddenWord(word),
                findExact: (word: string) => trie.has(word),
                hasForbiddenWords: trie.hasForbiddenWords,
                hasCompoundWords: trie.hasCompoundWords,
                hasNonStrictWords: trie.hasNonStrictWords,
            }),
            0,
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
        return !!this.#forbidIdx && this.#has(this.#forbidIdx, word);
    }

    nodeInfo(nodeIndex: number, accumulator?: Utf8Accumulator): TrieBlobNodeInfo {
        const acc = accumulator ?? Utf8Accumulator.create();
        const n = this.nodes[nodeIndex];
        const eow = !!(n[0] & this.bitMasksInfo.NodeMaskEOW);
        const children: TrieBlobNodeInfo['children'] = [];
        children.length = n.length - 1;
        for (let p = 1; p < n.length; ++p) {
            const v = n[p];
            const cIdx = v & this.bitMasksInfo.NodeMaskChildCharIndex;
            const a = acc.clone();
            const codePoint = a.decode(cIdx);
            const c = codePoint !== undefined ? String.fromCodePoint(codePoint) : '∎';
            const i = v >>> this.bitMasksInfo.NodeChildRefShift;
            children[p] = { c, i, cIdx };
        }
        return { eow, children };
    }

    /** number of nodes */
    get size() {
        return this.nodes.length;
    }

    /** Search from nodeIdx for the node index representing the character. */
    #searchNodeForChar(nodeIdx: number, char: string): number | undefined {
        const charIndexes = this.letterToUtf8Seq(char);
        return this.#lookupNode(nodeIdx, charIndexes);
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
            const node = new Uint32Array(count + 1);
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

export function nodesToJSON<T extends FastTrieBlobNode | Uint32Array>(nodes: Readonly<T[]>) {
    const mapNodeToAcc = new Map<T, Utf8Accumulator>();

    function mapNode(node: T, i: number) {
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
            c: [...node.slice(1)].map(mapChild),
        };
    }

    return nodes.map((n, i) => mapNode(n, i));
}
