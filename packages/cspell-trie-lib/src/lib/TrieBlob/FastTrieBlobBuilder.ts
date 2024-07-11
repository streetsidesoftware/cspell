import { fork, reduceSync } from '@cspell/cspell-pipe';
import { opMap, opTake, pipe, pipeSync } from '@cspell/cspell-pipe/sync';

import type { BuilderCursor, TrieBuilder } from '../Builder/index.js';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { assert } from '../utils/assert.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import { assertValidUtf16Character } from '../utils/text.js';
import { CharIndexBuilder } from './CharIndex.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import type { FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';
import { FastTrieBlobInternals } from './FastTrieBlobInternals.js';
import { resolveMap } from './resolveMap.js';
import { TrieBlob } from './TrieBlob.js';

type FastTrieBlobNode = number[];

export class FastTrieBlobBuilder implements TrieBuilder<FastTrieBlob> {
    private charIndex = new CharIndexBuilder();
    private nodes: FastTrieBlobNode[];
    private _readonly = false;
    private IdxEOW: number;
    private _cursor: BuilderCursor | undefined;

    private _options: Readonly<TrieInfo>;
    wordToCharacters = (word: string) => [...word];
    readonly bitMasksInfo: FastTrieBlobBitMaskInfo;

    constructor(options?: PartialTrieInfo, bitMasksInfo = FastTrieBlobBuilder.DefaultBitMaskInfo) {
        this._options = mergeOptionalWithDefaults(options);
        this.bitMasksInfo = bitMasksInfo;
        this.nodes = [[0], Object.freeze([FastTrieBlobBuilder.NodeMaskEOW]) as number[]];
        this.IdxEOW = 1;
    }

    setOptions(options: PartialTrieInfo): Readonly<TrieInfo> {
        this._options = mergeOptionalWithDefaults(this.options, options);
        return this.options;
    }

    get options(): Readonly<TrieInfo> {
        return this._options;
    }

    private getCharIndex(char: string): number {
        return this.charIndex.getCharIndex(char);
    }

    private wordToNodeCharIndexSequence(word: string): number[] {
        return this.charIndex.wordToCharIndexSequence(word);
    }

    private letterToNodeCharIndexSequence(letter: string): number[] {
        return this.charIndex.charToSequence(letter);
    }

    insert(word: string | Iterable<string> | string[]): this {
        this.#assertNotReadonly();
        if (typeof word === 'string') {
            return this._insert(word);
        }

        const forked = fork(word);
        const words = forked[1];
        if (this.charIndex.size < 50) {
            this.setCharacterSet(pipe(forked[0], opTake(5000)));
        }

        for (const w of words) {
            this._insert(w);
        }
        return this;
    }

    getCursor(): BuilderCursor {
        this.#assertNotReadonly();
        this._cursor ??= this.createCursor();
        return this._cursor;
    }

    private createCursor(): BuilderCursor {
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const NodeMaskEOW = this.bitMasksInfo.NodeMaskEOW;
        const LetterMask = this.bitMasksInfo.NodeMaskChildCharIndex;
        interface StackItem {
            nodeIdx: number;
            pos: number;
            /**
             * Pending High Surrogate
             * If the previous character was a high surrogate, then the next character
             * should be a low surrogate.
             */
            ps: string;
            /** the change in depth */
            dCount: number;
        }

        function childPos(node: number[], letterIdx: number): number {
            for (let i = 1; i < node.length; ++i) {
                if ((node[i] & LetterMask) === letterIdx) {
                    return i;
                }
            }
            return 0;
        }

        assert(this.nodes.length === 2);
        const eow = 1;
        const eowShifted = eow << NodeChildRefShift;
        const nodes = this.nodes;

        const stack: StackItem[] = [{ nodeIdx: 0, pos: 0, dCount: 1, ps: '' }];

        let nodeIdx = 0;
        let depth = 0;

        const insertChar = (char: string) => {
            // eslint-disable-next-line unicorn/prefer-code-point
            const cc = char.charCodeAt(0) & 0xfc00;
            // Work with partial surrogate pairs.
            if (cc === 0xd800 && char.length == 1) {
                // We have a high surrogate
                const s = stack[depth];
                const ns = stack[++depth];
                if (ns) {
                    ns.nodeIdx = s.nodeIdx;
                    ns.pos = s.pos;
                    ns.dCount = 1;
                    ns.ps = char;
                } else {
                    stack[depth] = { nodeIdx: s.nodeIdx, pos: s.pos, dCount: 1, ps: char };
                }
                return;
            }
            if (stack[depth].ps) {
                char = stack[depth].ps + char;
                assertValidUtf16Character(char);
            }
            const indexSeq = this.letterToNodeCharIndexSequence(char);
            for (let i = 0; i < indexSeq.length; ++i) {
                insertCharIndexes(indexSeq[i], i + 1);
            }
        };

        /**
         * A single character can result in multiple nodes being created
         * because it takes multiple bytes to represent a character.
         * @param charIndex - partial character index.
         * @param char - the source character
         */
        const insertCharIndexes = (charIndex: number, dCount: number) => {
            // console.warn('i %o at %o', char, nodeIdx);
            if (nodes[nodeIdx] && Object.isFrozen(nodes[nodeIdx])) {
                nodeIdx = nodes.push([...nodes[nodeIdx]]) - 1;
                // fix parent
                const { pos, nodeIdx: pNodeIdx } = stack[depth];
                const pNode = nodes[pNodeIdx];
                // console.warn('fix parent %o', { pNode, pos, pNodeIdx });
                pNode[pos] = (pNode[pos] & LetterMask) | (nodeIdx << NodeChildRefShift);
            }
            const node = nodes[nodeIdx] ?? [0];
            nodes[nodeIdx] = node;
            const letterIdx = charIndex;
            const hasIdx = childPos(node, letterIdx);
            const childIdx = hasIdx ? node[hasIdx] >>> NodeChildRefShift : nodes.length;
            const pos = hasIdx || node.push((childIdx << NodeChildRefShift) | letterIdx) - 1;
            ++depth;
            const s = stack[depth];
            if (s) {
                s.nodeIdx = nodeIdx;
                s.pos = pos;
                s.dCount = dCount;
                s.ps = '';
            } else {
                stack[depth] = { nodeIdx, pos, dCount, ps: '' };
            }
            nodeIdx = childIdx;
        };

        const markEOW = () => {
            // console.warn('$');
            if (nodeIdx === eow) return;
            const node = nodes[nodeIdx];
            if (!node) {
                // no children, set the parent to point to the common EOW.
                const { pos, nodeIdx: pNodeIdx } = stack[depth];
                const pNode = nodes[pNodeIdx];
                pNode[pos] = (pNode[pos] & LetterMask) | eowShifted;
            } else {
                nodes[nodeIdx] = node;
                node[0] |= NodeMaskEOW;
            }
            nodeIdx = eow;
        };

        const reference = (nodeId: number) => {
            const refNodeIdx = nodeId;
            // console.warn('r %o', { nodeId, nodeIdx, refNodeIdx, depth });
            // assert(nodes[nodeIdx] === undefined);
            // assert(nodes[refNodeIdx]);
            Object.freeze(nodes[refNodeIdx]);
            const s = stack[depth];
            nodeIdx = s.nodeIdx;
            const pos = s.pos;
            const node = nodes[nodeIdx];
            node[pos] = (refNodeIdx << NodeChildRefShift) | (node[pos] & LetterMask);
            // depth -= 1;
        };

        const backStep = (num: number) => {
            if (!num) return;
            // console.warn('<< %o', num);
            assert(num <= depth && num > 0);
            for (; num > 0; --num) {
                depth -= stack[depth].dCount;
            }
            nodeIdx = stack[depth + 1].nodeIdx;
        };

        const c: BuilderCursor = {
            insertChar,
            markEOW,
            reference,
            backStep,
        };

        return c;
    }

    private _insert(word: string): this {
        word = word.trim();
        if (!word) return this;
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const NodeMaskEOW = this.bitMasksInfo.NodeMaskEOW;
        const IdxEOW = this.IdxEOW;
        const nodes = this.nodes;
        const charIndexes = this.wordToNodeCharIndexSequence(word);
        const len = charIndexes.length;
        let nodeIdx = 0;
        for (let p = 0; p < len; ++p) {
            const letterIdx = charIndexes[p];
            const node = nodes[nodeIdx];
            const count = node.length;
            let i = count - 1;
            for (; i > 0; --i) {
                if ((node[i] & NodeMaskChildCharIndex) === letterIdx) {
                    break;
                }
            }
            if (i > 0) {
                nodeIdx = node[i] >>> NodeChildRefShift;
                if (nodeIdx === 1 && p < len - 1) {
                    nodeIdx = this.nodes.push([NodeMaskEOW]) - 1;
                    node[i] = (nodeIdx << NodeChildRefShift) | letterIdx;
                }
                continue;
            }

            // Not found, add a new node if it isn't the end of the word.
            nodeIdx = p < len - 1 ? this.nodes.push([0]) - 1 : IdxEOW;
            node.push((nodeIdx << NodeChildRefShift) | letterIdx);
        }
        if (nodeIdx > 1) {
            // Make sure the EOW is set
            const node = nodes[nodeIdx];
            node[0] |= NodeMaskEOW;
        }

        return this;
    }

    has(word: string): boolean {
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const NodeMaskEOW = this.bitMasksInfo.NodeMaskEOW;
        const nodes = this.nodes;
        const charIndexes = this.wordToNodeCharIndexSequence(word);
        const len = charIndexes.length;
        let nodeIdx = 0;
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
        }

        return !!(node[0] & NodeMaskEOW);
    }

    isReadonly(): boolean {
        return this._readonly;
    }

    freeze(): this {
        this._readonly = true;
        return this;
    }

    build(): FastTrieBlob {
        this._cursor = undefined;
        this._readonly = true;
        this.freeze();

        return FastTrieBlob.create(
            new FastTrieBlobInternals(this.nodes, this.charIndex.build(), this.bitMasksInfo),
            this.options,
        );
    }

    #assertNotReadonly(): void {
        assert(!this.isReadonly(), 'FastTrieBlobBuilder is readonly');
    }

    setCharacterSet(characters: string | Iterable<string>): void {
        this.#assertNotReadonly();
        const iChars = reduceSync(
            pipeSync(
                typeof characters === 'string' ? [characters.normalize('NFC')] : characters,
                opMap((word) => new Set(word.normalize('NFC'))),
            ),
            collect,
            new Set<string>(),
        );
        const letters = [...iChars].sort();
        // console.error('setCharacterSet', letters);
        for (const char of letters) {
            this.getCharIndex(char);
        }
    }

    static fromWordList(words: readonly string[] | Iterable<string>, options?: PartialTrieInfo): FastTrieBlob {
        const ft = new FastTrieBlobBuilder(options);
        return ft.insert(words).build();
    }

    static fromTrieRoot(root: TrieRoot): FastTrieBlob {
        const bitMasksInfo = FastTrieBlobBuilder.DefaultBitMaskInfo;
        const NodeChildRefShift = bitMasksInfo.NodeChildRefShift;
        const NodeCharIndexMask = bitMasksInfo.NodeMaskChildCharIndex;
        const NodeMaskEOW = bitMasksInfo.NodeMaskEOW;
        const tf = new FastTrieBlobBuilder(undefined, bitMasksInfo);
        tf.setCharacterSet(extractCharactersFromTrieRoot(root));
        const IdxEOW = tf.IdxEOW;

        const known = new Map<TrieNode, number>([[root, 0]]);

        function resolveNode(n: TrieNode): number {
            if (n.f && !n.c) return IdxEOW;
            const node = [n.f ? NodeMaskEOW : 0];
            return tf.nodes.push(node) - 1;
        }

        function walk(n: TrieNode): number {
            const found = known.get(n);
            if (found) return found;
            const nodeIdx = resolveMap(known, n, resolveNode);
            const node = tf.nodes[nodeIdx];
            if (!n.c) return nodeIdx;
            const children = Object.entries(n.c);
            for (let p = 0; p < children.length; ++p) {
                const [char, childNode] = children[p];
                addCharToNode(node, char, childNode);
            }
            return nodeIdx;
        }

        function resolveChild(node: FastTrieBlobNode, charIndex: number): number {
            let i = 1;
            for (i = 1; i < node.length && (node[i] & NodeCharIndexMask) !== charIndex; ++i) {
                // empty
            }
            return i;
        }

        function addCharToNode(node: FastTrieBlobNode, char: string, n: TrieNode): void {
            const indexSeq = tf.letterToNodeCharIndexSequence(char);
            for (const idx of indexSeq.slice(0, -1)) {
                const pos = resolveChild(node, idx);
                if (pos < node.length) {
                    node = tf.nodes[node[pos] >>> NodeChildRefShift];
                } else {
                    const next: FastTrieBlobNode = [0];
                    const nodeIdx = tf.nodes.push(next) - 1;
                    node[pos] = (nodeIdx << NodeChildRefShift) | idx;
                    node = next;
                }
            }
            const letterIdx = indexSeq[indexSeq.length - 1];
            const i = node.push(letterIdx) - 1;
            node[i] = (walk(n) << NodeChildRefShift) | letterIdx;
        }

        walk(root);

        return tf.build();
    }

    static NodeMaskEOW = TrieBlob.NodeMaskEOW;
    static NodeChildRefShift = TrieBlob.NodeChildRefShift;
    static NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;

    static DefaultBitMaskInfo: FastTrieBlobBitMaskInfo = {
        NodeMaskEOW: FastTrieBlobBuilder.NodeMaskEOW,
        NodeMaskChildCharIndex: FastTrieBlobBuilder.NodeMaskChildCharIndex,
        NodeChildRefShift: FastTrieBlobBuilder.NodeChildRefShift,
    };
}

function collect(acc: Set<string>, s: Iterable<string>): Set<string> {
    for (const w of s) {
        acc.add(w);
    }
    return acc;
}

function extractCharactersFromTrieRoot(root: TrieRoot): Set<string> {
    const collection = new Set<string>();

    let i = 0;
    let lastSize = 0;
    let lastChange = 0;

    function walk(n: TrieNode) {
        if (!n.c) return;
        ++i;
        lastSize = collection.size;
        collect(collection, Object.keys(n.c));
        if (collection.size > lastSize) {
            lastChange = i;
        }
        if (i - lastChange > 1000) {
            return;
        }
        Object.values(n.c).map(walk);
    }

    walk(root);

    return collection;
}
