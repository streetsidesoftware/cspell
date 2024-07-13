import { endianness } from 'node:os';

import { defaultTrieInfo } from '../constants.js';
import type { FindResult, ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import { findNode } from '../ITrieNode/trie-util.js';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieData } from '../TrieData.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import { CharIndex, CharIndexSeq } from './CharIndex.js';
import { NumberSequenceByteDecoderAccumulator, SpecialCharIndex } from './NumberSequenceByteDecoderAccumulator.js';
import { TrieBlobInternals, TrieBlobIRoot } from './TrieBlobIRoot.js';

const NodeHeaderNumChildrenBits = 8;
const NodeHeaderNumChildrenShift = 0;

const HEADER_SIZE_UINT32 = 8;
const HEADER_SIZE = HEADER_SIZE_UINT32 * 4;

const HEADER_OFFSET = 0;
const HEADER_OFFSET_SIG = HEADER_OFFSET;
const HEADER_OFFSET_ENDIAN = HEADER_OFFSET_SIG + 8;
const HEADER_OFFSET_VERSION = HEADER_OFFSET_ENDIAN + 4;
const HEADER_OFFSET_NODES = HEADER_OFFSET_VERSION + 4;
const HEADER_OFFSET_NODES_LEN = HEADER_OFFSET_NODES + 4;
const HEADER_OFFSET_CHAR_INDEX = HEADER_OFFSET_NODES_LEN + 4;
const HEADER_OFFSET_CHAR_INDEX_LEN = HEADER_OFFSET_CHAR_INDEX + 4;

const HEADER = {
    header: HEADER_OFFSET,
    sig: HEADER_OFFSET_SIG,
    version: HEADER_OFFSET_VERSION,
    endian: HEADER_OFFSET_ENDIAN,
    nodes: HEADER_OFFSET_NODES,
    nodesLen: HEADER_OFFSET_NODES_LEN,
    charIndex: HEADER_OFFSET_CHAR_INDEX,
    charIndexLen: HEADER_OFFSET_CHAR_INDEX_LEN,
} as const;

const headerSig = 'TrieBlob';
const version = '00.01.00';
const endianSig = 0x0403_0201;

const lookupCount = 50;

type MapSeqToNodeIdx = Map<number, number>;
type CacheNodeIdxLookup = Map<number, MapSeqToNodeIdx>;

export class TrieBlob implements TrieData {
    readonly info: Readonly<TrieInfo>;
    #forbidIdx: number | undefined;
    #compoundIdx: number | undefined;
    #nonStrictIdx: number | undefined;

    #size: number | undefined;
    #iTrieRoot: ITrieNodeRoot | undefined;
    /** the nodes data in 8 bits */
    #nodes8: Uint8Array;
    #beAdj = endianness() === 'BE' ? 3 : 0;

    /**
     * Lookup table for node indexes.
     * The first level is the node index.
     * The second level is the character index.
     * The value is the node index of the child node.
     * It speeds the lookup process up by about 20%.
     */
    #nodeIdxLookup: CacheNodeIdxLookup = new Map();

    readonly wordToCharacters = (word: string) => [...word];

    constructor(
        protected nodes: Uint32Array,
        readonly charIndex: CharIndex,
        info: PartialTrieInfo,
    ) {
        this.info = mergeOptionalWithDefaults(info);
        this.#prepLookup();
        this.#nodes8 = new Uint8Array(nodes.buffer, nodes.byteOffset + this.#beAdj);
        this.#forbidIdx = this._lookupNode(0, this.info.forbiddenWordPrefix);
        this.#compoundIdx = this._lookupNode(0, this.info.compoundCharacter);
        this.#nonStrictIdx = this._lookupNode(0, this.info.stripCaseAndAccentsPrefix);
    }

    public wordToNodeCharIndexSequence(word: string): CharIndexSeq {
        return this.charIndex.wordToCharIndexSequence(word);
    }

    private letterToNodeCharIndexSequence(letter: string): CharIndexSeq {
        return this.charIndex.getCharIndexSeq(letter);
    }

    has(word: string): boolean {
        return this._has8(0, word);
    }

    isForbiddenWord(word: string): boolean {
        return !!this.#forbidIdx && this._has8(this.#forbidIdx, word);
    }

    hasForbiddenWords(): boolean {
        return !!this.#forbidIdx;
    }

    hasCompoundWords(): boolean {
        return !!this.#compoundIdx;
    }

    hasNonStrictWords(): boolean {
        return !!this.#nonStrictIdx;
    }

    /**
     * Try to find the word in the trie. The word must be normalized.
     * If `strict` is `true` the case and accents must match.
     * Compound words are supported assuming that the compound character is in the trie.
     *
     * @param word - the word to find (normalized)
     * @param strict - if `true` the case and accents must match.
     */
    find(word: string, strict: boolean): FindResult | undefined {
        if (!this.hasCompoundWords()) {
            const found = this._has8(0, word);
            if (found) return { found: word, compoundUsed: false, caseMatched: true };
            if (strict || !this.#nonStrictIdx) return { found: false, compoundUsed: false, caseMatched: false };
            return { found: this._has8(this.#nonStrictIdx, word) && word, compoundUsed: false, caseMatched: false };
        }
        // @todo: handle compound words.
        return undefined;
    }

    getRoot(): ITrieNodeRoot {
        return (this.#iTrieRoot ??= this._getRoot());
    }

    private _getRoot(): ITrieNodeRoot {
        const trieData = new TrieBlobInternals(this.nodes, this.charIndex.charIndex, {
            NodeMaskEOW: TrieBlob.NodeMaskEOW,
            NodeMaskNumChildren: TrieBlob.NodeMaskNumChildren,
            NodeMaskChildCharIndex: TrieBlob.NodeMaskChildCharIndex,
            NodeChildRefShift: TrieBlob.NodeChildRefShift,
        });
        return new TrieBlobIRoot(trieData, 0, this.info, {
            findExact: (word) => this.has(word),
            isForbidden: (word) => this.isForbiddenWord(word),
            find: (word, strict) => this.find(word, strict),
        });
    }

    getNode(prefix: string): ITrieNode | undefined {
        return findNode(this.getRoot(), prefix);
    }

    /**
     * Check if the word is in the trie starting at the given node index.
     */
    private _has8(nodeIdx: number, word: string): boolean {
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const nodes8 = this.#nodes8;
        const wordIndexes = this.wordToNodeCharIndexSequence(word);
        const lookup = this.#nodeIdxLookup;
        const len = wordIndexes.length;
        let p = 0;
        for (let m = lookup.get(nodeIdx); m && p < len; ++p, m = lookup.get(nodeIdx)) {
            const i = m.get(wordIndexes[p]);
            if (!i) break;
            nodeIdx = i;
        }
        let node = nodes[nodeIdx];
        for (; p < len; ++p, node = nodes[nodeIdx]) {
            const letterIdx = wordIndexes[p];
            const count = node & NodeMaskNumChildren;
            const idx4 = nodeIdx << 2;
            if (count > 15) {
                const pEnd = idx4 + (count << 2);
                let i = idx4 + 4;
                let j = pEnd;
                while (j - i >= 4) {
                    const m = ((i + j) >> 1) & ~3;
                    if (nodes8[m] < letterIdx) {
                        i = m + 4;
                    } else {
                        j = m;
                    }
                }
                if (i > pEnd || nodes8[i] !== letterIdx) return false;
                nodeIdx = nodes[i >> 2] >>> NodeChildRefShift;
                continue;
            }
            let i = idx4 + count * 4;
            for (; i > idx4; i -= 4) {
                if (nodes8[i] === letterIdx) {
                    break;
                }
            }
            if (i <= idx4) return false;
            nodeIdx = nodes[i >> 2] >>> NodeChildRefShift;
        }

        return (node & TrieBlob.NodeMaskEOW) === TrieBlob.NodeMaskEOW;
    }

    /**
     * Find the node index for the given character.
     * @param nodeIdx - node index to start the search
     * @param char - character to look for
     * @returns
     */
    private _lookupNode(nodeIdx: number, char: string): number | undefined {
        const indexSeq = this.letterToNodeCharIndexSequence(char);
        const len = indexSeq.length;
        if (!len) return undefined;
        let currNodeIdx: number | undefined = nodeIdx;
        for (let i = 0; i < len; ++i) {
            currNodeIdx = this._lookupNodeByCharIndexSeq(currNodeIdx, indexSeq[i]);
            if (currNodeIdx === undefined) {
                return undefined;
            }
        }
        return currNodeIdx;
    }

    /**
     * Find the node index for the given character.
     * @param nodeIdx - node index to start the search
     * @param char - character to look for
     * @returns
     */
    private _lookupNodeByCharIndexSeq(nodeIdx: number, index: number): number | undefined {
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const node = nodes[nodeIdx];
        const letterIdx = index;
        const count = node & NodeMaskNumChildren;
        let i = count;
        for (; i > 0; --i) {
            if ((nodes[i + nodeIdx] & NodeMaskChildCharIndex) === letterIdx) {
                return nodes[i + nodeIdx] >>> NodeChildRefShift;
            }
        }
        return undefined;
    }

    *words(): Iterable<string> {
        interface StackItem {
            nodeIdx: number;
            pos: number;
            word: string;
            acc: NumberSequenceByteDecoderAccumulator;
        }
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeMaskEOW = TrieBlob.NodeMaskEOW;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const stack: StackItem[] = [
            { nodeIdx: 0, pos: 0, word: '', acc: NumberSequenceByteDecoderAccumulator.create() },
        ];
        let depth = 0;

        while (depth >= 0) {
            const { nodeIdx, pos, word, acc } = stack[depth];
            const node = nodes[nodeIdx];
            // pos is 0 when first entering a node
            if (!pos && node & NodeMaskEOW) {
                yield word;
            }
            const len = node & NodeMaskNumChildren;
            if (pos >= len) {
                --depth;
                continue;
            }
            const nextPos = ++stack[depth].pos;
            const entry = nodes[nodeIdx + nextPos];
            const nAcc = acc.clone();
            const charIdx = nAcc.decode(entry & NodeMaskChildCharIndex);
            const letter = (charIdx && this.charIndex.indexToCharacter(charIdx)) || '';
            ++depth;
            stack[depth] = {
                nodeIdx: entry >>> NodeChildRefShift,
                pos: 0,
                word: word + letter,
                acc: nAcc,
            };
        }
    }

    get size(): number {
        if (this.#size) return this.#size;
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const nodes = this.nodes;
        let p = 0;
        let count = 0;
        while (p < nodes.length) {
            ++count;
            p += (nodes[p] & NodeMaskNumChildren) + 1;
        }
        this.#size = count;
        return count;
    }

    toJSON() {
        return {
            options: this.info,
            nodes: nodesToJson(this.nodes),
            charIndex: this.charIndex,
        };
    }

    encodeBin(): Uint8Array {
        const charIndex = Buffer.from(this.charIndex.charIndex.join('\n'));
        const charIndexLen = (charIndex.byteLength + 3) & ~3; // round up to the nearest 4 byte boundary.
        const nodeOffset = HEADER_SIZE + charIndexLen;
        const size = nodeOffset + this.nodes.length * 4;
        const useLittle = isLittleEndian();
        const buffer = Buffer.alloc(size);
        const header = new DataView(buffer.buffer);
        const nodeData = new Uint8Array(this.nodes.buffer);
        buffer.write(headerSig, HEADER.sig, 'utf8');
        buffer.write(version, HEADER.version, 'utf8');
        header.setUint32(HEADER.endian, endianSig, useLittle);
        header.setUint32(HEADER.nodes, nodeOffset, useLittle);
        header.setUint32(HEADER.nodesLen, this.nodes.length, useLittle);
        header.setUint32(HEADER.charIndex, HEADER_SIZE, useLittle);
        header.setUint32(HEADER.charIndexLen, charIndex.length, useLittle);
        buffer.set(charIndex, HEADER_SIZE);
        buffer.set(nodeData, nodeOffset);
        // console.log('encodeBin: %o', this.toJSON());
        // console.log('encodeBin: buf %o nodes %o', buffer, this.nodes);
        return buffer;
    }

    static decodeBin(blob: Uint8Array): TrieBlob {
        if (!checkSig(blob)) {
            throw new ErrorDecodeTrieBlob('Invalid TrieBlob Header');
        }
        const header = new DataView(blob.buffer);
        const useLittle = isLittleEndian();
        if (header.getUint32(HEADER.endian, useLittle) !== endianSig) {
            throw new ErrorDecodeTrieBlob('Invalid TrieBlob Header');
        }
        const offsetNodes = header.getUint32(HEADER.nodes, useLittle);
        const lenNodes = header.getUint32(HEADER.nodesLen, useLittle);
        const offsetCharIndex = header.getUint32(HEADER.charIndex, useLittle);
        const lenCharIndex = header.getUint32(HEADER.charIndexLen, useLittle);
        const charIndex = Buffer.from(blob.subarray(offsetCharIndex, offsetCharIndex + lenCharIndex))
            .toString('utf8')
            .split('\n');
        const nodes = new Uint32Array(blob.buffer, offsetNodes, lenNodes);
        const trieBlob = new TrieBlob(nodes, new CharIndex(charIndex), defaultTrieInfo);
        // console.log('decodeBin: %o', trieBlob.toJSON());
        return trieBlob;
    }

    #prepLookup() {
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const stack: WalkStackItem[] = [];
        const iter = this.#walk(stack)[Symbol.iterator]();
        const nodes = this.nodes;

        let n: IteratorResult<number>;
        let deeper = true;
        while (!(n = iter.next(deeper)).done) {
            const depth = n.value;
            const nodeIdx = stack[depth].nodeIdx;
            const node = nodes[nodeIdx];
            const len = node & NodeMaskNumChildren;
            deeper = len > lookupCount;
            if (deeper) {
                const map = new Map<number, number>();
                this.#nodeIdxLookup.set(nodeIdx, map);
                for (let i = len; i > 0; --i) {
                    const n = nodes[i + nodeIdx];
                    map.set(n & NodeMaskChildCharIndex, n >> NodeChildRefShift);
                }
                // const parent = depth > 0 ? stack[depth - 1].nodeIdx : -1;
                // console.error('Node %d has %d children, parent %d', nodeIdx, len, parent);
            }
        }
    }

    *#walk(wStack: WalkStackItem[]): Generator<number, undefined, undefined | boolean> {
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const stack = wStack;
        stack[0] = { nodeIdx: 0, pos: 0 };
        let depth = 0;

        while (depth >= 0) {
            const { nodeIdx, pos } = stack[depth];
            const node = nodes[nodeIdx];
            // pos is 0 when first entering a node
            if (!pos) {
                const deeper = yield depth;
                if (deeper === false) {
                    --depth;
                    continue;
                }
            }
            const len = node & NodeMaskNumChildren;
            if (pos >= len) {
                --depth;
                continue;
            }
            const nextPos = ++stack[depth].pos;
            const entry = nodes[nodeIdx + nextPos];
            ++depth;
            stack[depth] = stack[depth] || { nodeIdx: 0, pos: 0 };
            (stack[depth].nodeIdx = entry >>> NodeChildRefShift), (stack[depth].pos = 0);
        }
    }

    static NodeMaskEOW = 0x0000_0100;
    static NodeMaskNumChildren = (1 << NodeHeaderNumChildrenBits) - 1;
    static NodeMaskNumChildrenShift = NodeHeaderNumChildrenShift;
    static NodeChildRefShift = 8;
    /**
     * Only 8 bits are reserved for the character index.
     * The max index is {@link TrieBlob.SpecialCharIndexMask} - 1.
     * Node chaining is used to reference higher character indexes.
     * - @see {@link TrieBlob.SpecialCharIndexMask}
     * - @see {@link TrieBlob.MaxCharIndex}
     */
    static NodeMaskChildCharIndex = 0x0000_00ff;
    /** SpecialCharIndexMask is used to indicate a node chain */
    static SpecialCharIndexMask = SpecialCharIndex.Mask;
    static MaxCharIndex = SpecialCharIndex.MaxCharIndex;

    static nodesView(trie: TrieBlob): Readonly<Uint32Array> {
        return new Uint32Array(trie.nodes);
    }
}

interface WalkStackItem {
    nodeIdx: number;
    pos: number;
}

function isLittleEndian(): boolean {
    const buf = new Uint8Array([1, 2, 3, 4]);
    const view = new DataView(buf.buffer);
    return view.getUint32(0, true) === 0x0403_0201;
}

function checkSig(blob: Uint8Array): boolean {
    if (blob.length < HEADER_SIZE) {
        return false;
    }
    const buf = Buffer.from(blob, 0, headerSig.length);
    if (buf.toString('utf8', 0, headerSig.length) !== headerSig) {
        return false;
    }
    return true;
}

class ErrorDecodeTrieBlob extends Error {
    constructor(message: string) {
        super(message);
    }
}

interface NodeElement {
    id: number;
    eow: boolean;
    c: { c: number | string; o: number }[];
    n: number;
}

function nodesToJson(nodes: Uint32Array) {
    function nodeElement(offset: number): NodeElement {
        const node = nodes[offset];
        const numChildren = node & TrieBlob.NodeMaskNumChildren;
        const eow = !!(node & TrieBlob.NodeMaskEOW);
        const children: { c: number | string; o: number }[] = [];
        for (let i = 1; i <= numChildren; ++i) {
            children.push({
                c: ('00' + (nodes[offset + i] & TrieBlob.NodeMaskChildCharIndex).toString(16)).slice(-2),
                o: nodes[offset + i] >>> TrieBlob.NodeChildRefShift,
            });
        }
        return { id: offset, eow, n: offset + numChildren + 1, c: children };
    }

    const elements: NodeElement[] = [];
    let offset = 0;
    while (offset < nodes.length) {
        const e = nodeElement(offset);
        elements.push(e);
        offset = e.n;
    }
    return elements;
}
