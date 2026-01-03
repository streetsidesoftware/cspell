import type { FindResult, ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import { findNode } from '../ITrieNode/trie-util.ts';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { StringTable } from '../StringTable/StringTable.ts';
import type { TrieData } from '../TrieData.ts';
import { endianness } from '../utils/endian.ts';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.ts';
import { matchEntirePrefix } from './prefix.ts';
import { decodeTrieBlobToBTrie, encodeTrieBlobToBTrie } from './TrieBlobEncoder.ts';
import {
    NodeChildIndexRefShift,
    NodeHeaderEOWMask,
    NodeHeaderNumChildrenMask,
    NodeHeaderPrefixMask,
    NodeHeaderPrefixShift,
    NodeMaskCharByte,
} from './TrieBlobFormat.ts';
import { TrieBlobInternals, TrieBlobIRoot } from './TrieBlobIRoot.ts';
import { TrieBlobInternalsLegacy, TrieBlobIRootLegacy } from './TrieBlobIRootLegacy.ts';
import type { U8Array, U32Array } from './TypedArray.ts';
import { createUint8ArrayCursor } from './TypedArrayCursor.ts';
import { Utf8Accumulator } from './Utf8.ts';
import { createTextToUtf8Cursor, type TextToUtf8Cursor } from './Utf8Cursor.ts';

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
        this.NodeMaskNumChildren = NodeHeaderNumChildrenMask;
        this.NodeChildRefShift = NodeChildIndexRefShift;
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
            // this.#stringTable,
            {
                NodeMaskEOW: NodeHeaderEOWMask,
                NodeMaskNumChildren: NodeHeaderNumChildrenMask,
                NodeMaskChildCharIndex: NodeMaskCharByte,
                NodeChildRefShift: NodeChildIndexRefShift,
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
                hasPreferredSuggestions: this.hasPreferredSuggestions,
            },
        );
        return new TrieBlobIRoot(trieData, 0, this.info, {
            find: this.find.bind(this),
        });
    }

    getRootLegacy(): ITrieNodeRoot {
        const trieData = new TrieBlobInternalsLegacy(
            this.nodes,
            // this.#stringTable,
            {
                NodeMaskEOW: NodeHeaderEOWMask,
                NodeMaskNumChildren: NodeHeaderNumChildrenMask,
                NodeMaskChildCharIndex: NodeMaskCharByte,
                NodeChildRefShift: NodeChildIndexRefShift,
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
                hasPreferredSuggestions: this.hasPreferredSuggestions,
            },
        );
        return new TrieBlobIRootLegacy(trieData, 0, this.info, {
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
        const m = NodeHeaderEOWMask;
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

        const _nodes = this.nodes;
        const _nodes8 = this.#nodes8;
        const pfxShift = NodeHeaderPrefixShift;

        const p: TextToUtf8Cursor = createTextToUtf8Cursor(text);
        for (; !p.done; p.next()) {
            const nodes = _nodes;
            const nodes8 = _nodes8;
            const node = nodes[nodeIdx];
            const prefixIdx = node >>> pfxShift;
            const pfx = prefixIdx ? this.#stringTable.getStringBytes(prefixIdx) : undefined;
            if (pfx && !matchEntirePrefix(p, createUint8ArrayCursor(pfx))) return undefined;

            const charVal = p.cur() & 0xff;
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
            } else {
                let i = idx4 + count * 4;
                for (; i > idx4; i -= 4) {
                    if (nodes8[i] === charVal) {
                        break;
                    }
                }
                if (i <= idx4) return undefined;
                nodeIdx = nodes[i >> 2] >>> 8; // TrieBlob.NodeChildRefShift
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
        const NodeMaskNumChildren = NodeHeaderNumChildrenMask;
        const NodeMaskEOW = NodeHeaderEOWMask;
        const NodeMaskChildCharIndex = NodeMaskCharByte;
        const NodeChildRefShift = NodeChildIndexRefShift;
        const nodeHeaderPrefixShift = NodeHeaderPrefixShift;
        const nodes = this.nodes;
        const st = this.#stringTable;
        const stack: StackItem[] = [{ nodeIdx: rootIdx, pos: 0, word: '', acc: Utf8Accumulator.create() }];
        let depth = 0;

        while (depth >= 0) {
            const s = stack[depth];
            if (!s.pos) {
                applyPrefixString(s);
            }
            const { nodeIdx, pos, word, acc } = s;
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

        function applyPrefixString(s: StackItem): void {
            const prefixIdx = nodes[s.nodeIdx] >>> nodeHeaderPrefixShift;
            const pfx = prefixIdx ? st.getStringBytes(prefixIdx) : undefined;
            if (!pfx) return;
            s.word += s.acc.decodeBytesToString(pfx);
        }
    }

    get size(): number {
        if (this.#size) return this.#size;
        const NodeMaskNumChildren = NodeHeaderNumChildrenMask;
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

    *#sWalk(stack: RefWithBChar[], depth: number = 0): Generator<number, undefined, boolean> {
        const MaskNumChildren = NodeHeaderNumChildrenMask;
        const NodeRefShift = NodeChildIndexRefShift;
        const CharMask = NodeMaskCharByte;
        const PrefixMask = NodeHeaderPrefixMask;
        const PrefixShift = NodeHeaderPrefixShift;

        const nodes = this.nodes;
        stack[0] ||= { nodeIdx: 0, pfx: 0, pos: 0, prefix: undefined, bChar: 0 };

        while (depth >= 0) {
            let s = stack[depth];
            const { nodeIdx, pos, pfx, prefix } = s;

            // pos is 0 when first entering a node
            if (!pos) {
                const deeper = yield depth;
                if (!deeper) {
                    --depth;
                    continue;
                }
            }

            // next prefix child
            if (prefix) {
                // if there is a prefix, the pos is either 0 (start) or 1 (done).
                if (pos) {
                    --depth;
                    continue;
                }

                s.pos = 1; // mark the prefix char as consumed.
                ++depth;
                // init or reuse next depth
                stack[depth] ||= { nodeIdx: 0, pfx: 0, pos: 0, prefix: undefined, bChar: 0 };
                s = stack[depth];
                s.nodeIdx = nodeIdx;
                s.pfx = pfx + 1;
                s.pos = 0;
                s.prefix = s.pfx < prefix.length ? prefix : undefined;
                s.bChar = prefix[pfx];
                continue;
            }

            const node = nodes[nodeIdx];
            const len = node & MaskNumChildren;
            if (pos >= len) {
                --depth;
                continue;
            }

            // next child
            const nextPos = ++s.pos;
            const entry = nodes[nodeIdx + nextPos];
            const eNodeIdx = entry >>> NodeRefShift;
            ++depth;
            stack[depth] ||= { nodeIdx: 0, pfx: 0, pos: 0, prefix: undefined, bChar: 0 };
            s = stack[depth];
            s.nodeIdx = eNodeIdx;
            s.pfx = 0;
            s.pos = 0;
            const pfxV = nodes[eNodeIdx] & PrefixMask;
            s.prefix = pfxV ? this.#stringTable.getStringBytes(pfxV >>> PrefixShift) : undefined;
            s.bChar = entry & CharMask;
        }
    }

    getChildrenFromRef(ref: TrieBlobNodeRef): [string, TrieBlobNodeRef][] {
        const acc: Utf8Accumulator = Utf8Accumulator.create();
        const accStack: Utf8Accumulator[] = [acc];
        const stack: RefWithBChar[] = [{ ...ref, pos: 0, bChar: 0 }];
        const results: [string, TrieBlobNodeRef][] = [];

        const iterable = this.#sWalk(stack);

        let deeper = false;
        for (let next = iterable.next(true); !next.done; next = iterable.next(deeper)) {
            const depth = next.value;

            // console.log('value: %o', next);

            if (depth <= 0) {
                if (!depth) {
                    deeper = true;
                    continue;
                }
                break;
            }

            const s = stack[depth];
            accStack[depth] = accStack[depth - 1].clone(accStack[depth]);
            const acc = accStack[depth];
            const char = acc.decode(s.bChar);

            // console.log(
            //     '%d, %s %o %o, %o %o %s',
            //     depth,
            //     stack
            //         .slice(0, depth + 1)
            //         .map((s) => charToHex(s.bChar))
            //         .join(' -> '),
            //     char,
            //     String.fromCodePoint(char || '.'.codePointAt(0) || 0),
            //     { value: acc.value, remaining: acc.remaining },
            //     s.pfx,
            //     '[' + (s.prefix ? [...s.prefix].map(charToHex).join(', ') : '') + ']',
            // );

            if (char) {
                deeper = false;
                results.push([String.fromCodePoint(char), { nodeIdx: s.nodeIdx, pfx: s.pfx, prefix: s.prefix }]);
                continue;
            }
            deeper = true;
        }

        return results;
    }

    /**
     * Checks if a location is at an end-of-word node.
     * @param location
     * @returns
     */
    isRefEOW(location: TrieBlobNodeRef): boolean {
        if (location.prefix) return false;
        const node = this.nodes[location.nodeIdx];
        return !!(node & NodeHeaderEOWMask);
    }

    toRef(nodeIdx: number): TrieBlobNodeRef {
        const node = this.nodes[nodeIdx];
        const pfxV = node & NodeHeaderPrefixMask;
        const prefix = pfxV ? this.#stringTable.getStringBytes(pfxV >>> NodeHeaderPrefixShift) : undefined;
        return { nodeIdx, pfx: 0, prefix };
    }

    rootRef(): TrieBlobNodeRef {
        return this.toRef(0);
    }

    getNodeDebugInfo(ref: TrieBlobNodeRef): NodeDebugInfo {
        const node = this.nodes[ref.nodeIdx];
        const isEOW = !!(node & NodeHeaderEOWMask);
        const count = node & NodeHeaderNumChildrenMask;
        const children = new Map<string, string>();
        for (let i = 1; i <= count; ++i) {
            const entry = this.nodes[ref.nodeIdx + i];
            const c = entry & NodeMaskCharByte;
            const idx = entry >>> NodeChildIndexRefShift;
            children.set(charToHex(c), numberToHex(idx) + ' ' + idx);
        }
        return {
            ...ref,
            prefix: ref.prefix ? [...ref.prefix].map(charToHex).join(', ') : '',
            isEOW,
            count,
            children,
        };
    }

    static copyNodes(trie: TrieBlob): Readonly<U32Array> {
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
        const numChildren = node & NodeHeaderNumChildrenMask;
        const eow = !!(node & NodeHeaderEOWMask);
        const children: { c: number | string; o: number }[] = [];
        for (let i = 1; i <= numChildren; ++i) {
            children.push({
                c: ('00' + (nodes[offset + i] & NodeMaskCharByte).toString(16)).slice(-2),
                o: nodes[offset + i] >>> NodeChildIndexRefShift,
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
    const MaskNumChildren = NodeHeaderNumChildrenMask;
    const MaskChildCharIndex = NodeMaskCharByte;

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

/**
 * A reference to a node in the TrieBlob.
 * It includes the node index, the prefix index.
 */
export interface TrieBlobNodeRef {
    /** The index of the node */
    nodeIdx: number;
    /** The index into the prefix if it exists. */
    pfx: number;
    /** the prefix bytes if they exist */
    prefix: U8Array | undefined;
}

interface RefWithBChar extends TrieBlobNodeRef {
    /** The current child, 0 = not started */
    pos: number;
    /**
     * The utf8 byte value of character that got us here.
     *
     * 0 if not available, e.g., at the root node or
     */
    bChar: number;
}

interface NodeDebugInfo extends Omit<TrieBlobNodeRef, 'prefix'> {
    prefix: string | undefined;
    isEOW: boolean;
    count: number;
    children: Map<string, string>;
}

export function numberToHex(n: number): string {
    const digits = n.toString(16).padStart(8, '0');
    return '0x' + digits.slice(0, 4) + '_' + digits.slice(4);
}

function charToHex(c: number): string {
    return c.toString(16).padStart(2, '0') + ' ' + (c >= 32 && c <= 126 ? String.fromCodePoint(c) : '.');
}
