import { defaultTrieInfo } from '../constants.js';
import type { ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import { findNode } from '../ITrieNode/trie-util.js';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieData } from '../TrieData.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import {
    NumberSequenceByteDecoderAccumulator,
    NumberSequenceByteEncoderDecoder,
} from './NumberSequenceByteDecoderAccumulator.js';
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

export class TrieBlob implements TrieData {
    protected charToIndexMap: Record<string, number>;
    readonly info: Readonly<TrieInfo>;
    private _forbidIdx: number | undefined;
    private _size: number | undefined;
    private _iTrieRoot: ITrieNodeRoot | undefined;
    wordToCharacters: (word: string) => string[];

    constructor(
        protected nodes: Uint32Array,
        readonly charIndex: readonly string[],
        info: PartialTrieInfo,
    ) {
        this.info = mergeOptionalWithDefaults(info);
        this.wordToCharacters = (word: string) => [...word];
        this.charToIndexMap = Object.create(null);
        Object.freeze(this.charIndex);
        for (let i = 0; i < charIndex.length; ++i) {
            const char = charIndex[i];
            this.charToIndexMap[char.normalize('NFC')] = i;
            this.charToIndexMap[char.normalize('NFD')] = i;
        }
        this._forbidIdx = this._lookupNode(0, this.info.forbiddenWordPrefix);
    }

    private _lookUpCharIndex = (char: string): number => {
        return this.charToIndexMap[char] || 0;
    };

    public wordToNodeCharIndexSequence(word: string): number[] {
        return TrieBlob.charactersToCharIndexSequence(this.wordToCharacters(word), this._lookUpCharIndex);
    }

    private letterToNodeCharIndexSequence(letter: string): number[] {
        return TrieBlob.toCharIndexSequence(this._lookUpCharIndex(letter));
    }

    has(word: string): boolean {
        return this._has(0, word);
    }

    isForbiddenWord(word: string): boolean {
        return !!this._forbidIdx && this._has(this._forbidIdx, word);
    }

    hasForbiddenWords(): boolean {
        return !!this._forbidIdx;
    }

    getRoot(): ITrieNodeRoot {
        return (this._iTrieRoot ??= this._getRoot());
    }

    private _getRoot(): ITrieNodeRoot {
        const trieData = new TrieBlobInternals(this.nodes, this.charIndex, this.charToIndexMap, {
            NodeMaskEOW: TrieBlob.NodeMaskEOW,
            NodeMaskNumChildren: TrieBlob.NodeMaskNumChildren,
            NodeMaskChildCharIndex: TrieBlob.NodeMaskChildCharIndex,
            NodeChildRefShift: TrieBlob.NodeChildRefShift,
        });
        return new TrieBlobIRoot(trieData, 0, this.info);
    }

    getNode(prefix: string): ITrieNode | undefined {
        return findNode(this.getRoot(), prefix);
    }

    private _has(nodeIdx: number, word: string): boolean {
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const wordIndexes = this.wordToNodeCharIndexSequence(word);
        const len = wordIndexes.length;
        let node = nodes[nodeIdx];
        for (let p = 0; p < len; ++p, node = nodes[nodeIdx]) {
            const letterIdx = wordIndexes[p];
            const count = node & NodeMaskNumChildren;
            let i = count;
            for (; i > 0; --i) {
                if ((nodes[i + nodeIdx] & NodeMaskChildCharIndex) === letterIdx) {
                    break;
                }
            }
            if (i < 1) return false;
            nodeIdx = nodes[i + nodeIdx] >>> NodeChildRefShift;
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
            const letter = (charIdx && this.charIndex[charIdx]) || '';
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
        if (this._size) return this._size;
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const nodes = this.nodes;
        let p = 0;
        let count = 0;
        while (p < nodes.length) {
            ++count;
            p += (nodes[p] & NodeMaskNumChildren) + 1;
        }
        this._size = count;
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
        const charIndex = Buffer.from(this.charIndex.join('\n'));
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
        const trieBlob = new TrieBlob(nodes, charIndex, defaultTrieInfo);
        // console.log('decodeBin: %o', trieBlob.toJSON());
        return trieBlob;
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
    static SpecialCharIndexMask = 0xf8;
    static MaxCharIndex = this.SpecialCharIndexMask - 1;
    /**
     * SpecialCharIndex8bit is used to indicate a node chain. Where the final character index is 248 + the index found in the next node.
     */
    static SpecialCharIndex8bit = this.SpecialCharIndexMask | 0x01;
    static SpecialCharIndex16bit = this.SpecialCharIndexMask | 0x02;
    static SpecialCharIndex24bit = this.SpecialCharIndexMask | 0x03;

    /**
     * Since it is only possible to store single byte indexes, a multi-byte index is stored as a sequence of indexes chained between nodes.
     * @param charIndex - character index to convert to a sequence of indexes
     * @returns encoded index values.
     */
    static toCharIndexSequence(charIndex: number): number[] {
        return NumberSequenceByteEncoderDecoder.encode(charIndex);
    }

    static fromCharIndexSequence(charIndexes: Iterable<number>): Iterable<number> {
        return NumberSequenceByteEncoderDecoder.decodeSequence(charIndexes);
    }

    static charactersToCharIndexSequence(
        chars: readonly string[],
        charToIndexMap: Readonly<Record<string, number>> | ((char: string) => number),
    ): number[] {
        const fn = typeof charToIndexMap === 'function' ? charToIndexMap : (c: string) => charToIndexMap[c];
        return chars.map(fn).flatMap((c) => this.toCharIndexSequence(c));
    }

    static charIndexSequenceToCharacters(
        charIndexSequence: number[],
        charIndex: readonly string[] | Readonly<Record<number, string>>,
    ): readonly string[] {
        const chars: readonly string[] = [...this.fromCharIndexSequence(charIndexSequence)].map((c) => charIndex[c]);
        return chars;
    }

    static nodesView(trie: TrieBlob): Readonly<Uint32Array> {
        return new Uint32Array(trie.nodes);
    }
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
