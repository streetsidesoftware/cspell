import type { FindResult, ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import { findNode } from '../ITrieNode/trie-util.ts';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { StringTable } from '../StringTable/StringTable.ts';
import type { TrieData } from '../TrieData.ts';
import { endianness } from '../utils/endian.ts';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.ts';
import { decodeTrieBlobToBTrie, encodeTrieBlobToBTrie } from './TrieBlobEncoder.ts';
import {
    NodeChildIndexRefShift,
    NodeHeaderEOWMask,
    NodeHeaderNumChildrenMask,
    NodeHeaderNumChildrenShift,
} from './TrieBlobFormat.ts';
import { TrieBlobInternals, TrieBlobIRoot } from './TrieBlobIRoot.ts';
import { encodeTextToUtf8_32Rev, Utf8Accumulator } from './Utf8.ts';

type U8Array = Uint8Array<ArrayBuffer>;
type U32Array = Uint32Array<ArrayBuffer>;

export class TrieBlob implements TrieData {
    readonly info: Readonly<TrieInfo>;
    #forbidIdx: number | undefined;
    #compoundIdx: number | undefined;
    #nonStrictIdx: number | undefined;
    #suggestIdx: number | undefined;

    #size: number | undefined;
    #iTrieRoot: ITrieNodeRoot | undefined;
    /** the nodes data in 8 bits */
    #nodes8: U8Array;
    #stringTable: StringTable;
    #beAdj = endianness() === 'BE' ? 3 : 0;

    readonly wordToCharacters = (word: string): string[] => [...word];
    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;
    readonly nodes: U32Array;
    readonly NodeMaskNumChildren: number;
    readonly NodeChildRefShift: number;
    readonly hasPreferredSuggestions: boolean;

    constructor(nodes: U32Array, stringTable: StringTable, info: PartialTrieInfo) {
        this.nodes = nodes;
        this.#stringTable = stringTable;
        trieBlobSort(nodes);
        this.info = mergeOptionalWithDefaults(info);
        // this.#prepLookup();
        this.#nodes8 = new Uint8Array(nodes.buffer, nodes.byteOffset + this.#beAdj);
        this.#forbidIdx = this.#findNode(0, this.info.forbiddenWordPrefix);
        this.#compoundIdx = this.#findNode(0, this.info.compoundCharacter);
        this.#nonStrictIdx = this.#findNode(0, this.info.stripCaseAndAccentsPrefix);
        this.#suggestIdx = this.#findNode(0, this.info.suggestionPrefix);
        this.hasForbiddenWords = !!this.#forbidIdx;
        this.hasCompoundWords = !!this.#compoundIdx;
        this.hasNonStrictWords = !!this.#nonStrictIdx;
        this.NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        this.NodeChildRefShift = TrieBlob.NodeChildRefShift;
        this.hasPreferredSuggestions = !!this.#suggestIdx;
    }

    has(word: string): boolean {
        return this.#hasWord(0, word);
    }

    isForbiddenWord(word: string): boolean {
        return !!this.#forbidIdx && this.#hasWord(this.#forbidIdx, word);
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
        const found = this.#hasWord(0, word);
        if (found || !this.hasCompoundWords) {
            if (found) return { found: word, compoundUsed: false, caseMatched: true, forbidden: undefined };
            if (strict || !this.#nonStrictIdx)
                return { found: false, compoundUsed: false, caseMatched: false, forbidden: undefined };
            return {
                found: this.#hasWord(this.#nonStrictIdx, word) && word,
                compoundUsed: false,
                caseMatched: false,
                forbidden: undefined,
            };
        }
        // @todo: handle compound words.
        return undefined;
    }

    getRoot(): ITrieNodeRoot {
        return (this.#iTrieRoot ??= this._getRoot());
    }

    private _getRoot(): ITrieNodeRoot {
        const trieData = new TrieBlobInternals(
            this.nodes,
            {
                NodeMaskEOW: TrieBlob.NodeMaskEOW,
                NodeMaskNumChildren: TrieBlob.NodeMaskNumChildren,
                NodeMaskChildCharIndex: TrieBlob.NodeMaskChildCharIndex,
                NodeChildRefShift: TrieBlob.NodeChildRefShift,
            },
            {
                nodeFindExact: (idx, word) => this.#hasWord(idx, word),
                nodeGetChild: (idx, letter) => this.#findNode(idx, letter),
                nodeFindNode: (idx, word) => this.#findNode(idx, word),
                isForbidden: (word) => this.isForbiddenWord(word),
                findExact: (word) => this.has(word),
                hasCompoundWords: this.hasCompoundWords,
                hasForbiddenWords: this.hasForbiddenWords,
                hasNonStrictWords: this.hasNonStrictWords,
                hasPreferredSuggestions: false,
            },
        );
        return new TrieBlobIRoot(trieData, 0, this.info, {
            find: this.find.bind(this),
        });
    }

    getNode(prefix: string): ITrieNode | undefined {
        return findNode(this.getRoot(), prefix);
    }

    get stringTable(): StringTable {
        return this.#stringTable;
    }

    /**
     * Check if the word is in the trie starting at the given node index.
     */
    #hasWord(nodeIdx: number, word: string): boolean {
        const nodeIdxFound = this.#findNode(nodeIdx, word);
        if (!nodeIdxFound) return false;
        const node = this.nodes[nodeIdxFound];
        const m = TrieBlob.NodeMaskEOW;
        return (node & m) === m;
    }

    /**
     * Find the node index for the given Utf8 character sequence.
     * @param nodeIdx - node index to start the search
     * @param seq - the byte sequence of the character to look for
     * @returns
     */
    #findNode(nodeIdx: number, text: string): number | undefined {
        // Using magic numbers in #findNode improves the performance by about 10%.
        const p = { text, offset: 0, bytes: 0 };

        const _nodes = this.nodes;
        const _nodes8 = this.#nodes8;

        for (; p.offset < p.text.length; ) {
            const nodes = _nodes;
            const nodes8 = _nodes8;
            let node = nodes[nodeIdx];

            for (let code = encodeTextToUtf8_32Rev(p); code; code >>>= 8) {
                const charVal = code & 0xff;
                const count = node & 0xff; // TrieBlob.NodeMaskNumChildren
                const idx4 = nodeIdx << 2;
                // Binary search for the character in the child nodes.
                if (count > 15) {
                    const pEnd = idx4 + (count << 2);
                    let i = idx4 + 4;
                    let j = pEnd;
                    while (j - i >= 4) {
                        const m = ((i + j) >> 1) & ~3;
                        if (nodes8[m] < charVal) {
                            i = m + 4;
                        } else {
                            j = m;
                        }
                    }
                    if (i > pEnd || nodes8[i] !== charVal) return undefined;
                    nodeIdx = nodes[i >> 2] >>> 8; // TrieBlob.NodeChildRefShift
                    node = nodes[nodeIdx];
                    continue;
                }
                let i = idx4 + count * 4;
                for (; i > idx4; i -= 4) {
                    if (nodes8[i] === charVal) {
                        break;
                    }
                }
                if (i <= idx4) return undefined;
                nodeIdx = nodes[i >> 2] >>> 8; // TrieBlob.NodeChildRefShift
                node = nodes[nodeIdx];
            }
        }
        return nodeIdx;
    }

    /**
     * get an iterable for all the words in the dictionary.
     * @param prefix - optional prefix to filter the words returned. The words will be prefixed with this value.
     */
    *words(prefix?: string): Iterable<string> {
        if (!prefix) {
            yield* this.#walk(0);
            return;
        }
        const nodeIdx = this.#findNode(0, prefix);
        if (!nodeIdx) return;

        for (const suffix of this.#walk(nodeIdx)) {
            yield prefix + suffix;
        }
    }

    *#walk(rootIdx: number): Iterable<string> {
        interface StackItem {
            nodeIdx: number;
            pos: number;
            word: string;
            acc: Utf8Accumulator;
        }
        const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
        const NodeMaskEOW = TrieBlob.NodeMaskEOW;
        const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
        const NodeChildRefShift = TrieBlob.NodeChildRefShift;
        const nodes = this.nodes;
        const stack: StackItem[] = [{ nodeIdx: rootIdx, pos: 0, word: '', acc: Utf8Accumulator.create() }];
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
            const codePoint = nAcc.decode(entry & NodeMaskChildCharIndex);
            const letter = (codePoint && String.fromCodePoint(codePoint)) || '';
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

    toJSON(): {
        options: Readonly<TrieInfo>;
        nodes: NodeElement[];
    } {
        return {
            options: this.info,
            nodes: nodesToJson(this.nodes),
        };
    }

    encodeToBTrie(): U8Array {
        return this.encodeBin();
    }

    encodeBin(): U8Array {
        return encodeTrieBlobToBTrie({
            nodes: this.nodes,
            stringTable: this.stringTable,
            info: this.info,
            characteristics: this,
        });
    }

    static decodeBin(blob: U8Array): TrieBlob {
        const info = decodeTrieBlobToBTrie(blob);
        const trieBlob = new TrieBlob(info.nodes, info.stringTable, info.info);
        // console.log('decodeBin: %o', trieBlob.toJSON());
        return trieBlob;
    }

    // #prepLookup() {
    //     const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
    //     const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
    //     const NodeChildRefShift = TrieBlob.NodeChildRefShift;
    //     const stack: WalkStackItem[] = [];
    //     const iter = this.#walk(stack)[Symbol.iterator]();
    //     const nodes = this.nodes;

    //     let n: IteratorResult<number>;
    //     let deeper = true;
    //     while (!(n = iter.next(deeper)).done) {
    //         const depth = n.value;
    //         const nodeIdx = stack[depth].nodeIdx;
    //         const node = nodes[nodeIdx];
    //         const len = node & NodeMaskNumChildren;
    //         deeper = len > lookupCount;
    //         if (deeper) {
    //             const map = new Map<number, number>();
    //             this.#nodeIdxLookup.set(nodeIdx, map);
    //             for (let i = len; i > 0; --i) {
    //                 const n = nodes[i + nodeIdx];
    //                 map.set(n & NodeMaskChildCharIndex, n >> NodeChildRefShift);
    //             }
    //             // const parent = depth > 0 ? stack[depth - 1].nodeIdx : -1;
    //             // console.error('Node %d has %d children, parent %d', nodeIdx, len, parent);
    //         }
    //     }
    // }

    // Keeping this for a bit, until we are sure we don't need it.
    // *#walk(wStack: WalkStackItem[]): Generator<number, undefined, undefined | boolean> {
    //     const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
    //     const NodeChildRefShift = TrieBlob.NodeChildRefShift;
    //     const nodes = this.nodes;
    //     const stack = wStack;
    //     stack[0] = { nodeIdx: 0, pos: 0 };
    //     let depth = 0;

    //     while (depth >= 0) {
    //         const { nodeIdx, pos } = stack[depth];
    //         const node = nodes[nodeIdx];
    //         // pos is 0 when first entering a node
    //         if (!pos) {
    //             const deeper = yield depth;
    //             if (deeper === false) {
    //                 --depth;
    //                 continue;
    //             }
    //         }
    //         const len = node & NodeMaskNumChildren;
    //         if (pos >= len) {
    //             --depth;
    //             continue;
    //         }
    //         const nextPos = ++stack[depth].pos;
    //         const entry = nodes[nodeIdx + nextPos];
    //         ++depth;
    //         stack[depth] = stack[depth] || { nodeIdx: 0, pos: 0 };
    //         (stack[depth].nodeIdx = entry >>> NodeChildRefShift), (stack[depth].pos = 0);
    //     }
    // }

    static NodeMaskEOW: number = NodeHeaderEOWMask;
    static NodeMaskNumChildren: number = NodeHeaderNumChildrenMask;
    static NodeMaskNumChildrenShift: number = NodeHeaderNumChildrenShift;
    static NodeChildRefShift: number = NodeChildIndexRefShift;

    /**
     * Only 8 bits are reserved for the character index.
     * The max index is {@link TrieBlob.SpecialCharIndexMask} - 1.
     * Node chaining is used to reference higher character indexes.
     * - @see {@link TrieBlob.SpecialCharIndexMask}
     * - @see {@link TrieBlob.MaxCharIndex}
     */
    static NodeMaskChildCharIndex: number = 0x0000_00ff;

    static nodesView(trie: TrieBlob): Readonly<U32Array> {
        return new Uint32Array(trie.nodes);
    }
}

interface NodeElement {
    id: number;
    eow: boolean;
    c: { c: number | string; o: number }[];
    n: number;
}

function nodesToJson(nodes: U32Array) {
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

/**
 * Sorts the child nodes in the trie to ensure binary lookup works.
 * @param data
 */
function trieBlobSort(data: U32Array) {
    const MaskNumChildren = TrieBlob.NodeMaskNumChildren;
    const MaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;

    const limit = data.length;
    let idx = 0;
    let node = data[0];
    let nc = node & MaskNumChildren;
    for (; idx < limit; idx += nc + 1, node = data[idx], nc = node & MaskNumChildren) {
        if (!nc) continue;
        const start = idx + 1;
        const end = start + nc;
        let last = 0;
        let i = start;
        for (; i < end; ++i) {
            const cIdx = data[i] & MaskChildCharIndex;
            if (last >= cIdx) break;
            last = cIdx;
        }
        if (i === end) continue;

        const sorted = data.slice(start, end).sort((a, b) => (a & MaskChildCharIndex) - (b & MaskChildCharIndex));
        sorted.forEach((v, i) => (data[start + i] = v));
    }
}
