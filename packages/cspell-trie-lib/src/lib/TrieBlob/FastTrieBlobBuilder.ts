import assert from 'node:assert';

import type { BuilderCursor, TrieBuilder } from '../Builder/index.js';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import { assertValidUtf16Character } from '../utils/text.js';
import { CharIndexBuilder } from './CharIndex.js';
import { FastTrieBlob, nodesToJSON } from './FastTrieBlob.js';
import type { FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';
import { FastTrieBlobInternals, sortNodes } from './FastTrieBlobInternals.js';
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

    private wordToUtf8Seq(word: string): Readonly<number[]> {
        return this.charIndex.wordToUtf8Seq(word);
    }

    private letterToUtf8Seq(letter: string): Readonly<number[]> {
        return this.charIndex.charToUtf8Seq(letter);
    }

    insert(word: string | Iterable<string> | string[]): this {
        this.#assertNotReadonly();
        if (typeof word === 'string') {
            return this._insert(word);
        }

        const words = word;

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
        const refNodes: number[] = [0, 1];

        interface StackItem {
            nodeIdx: number;
            pos: number;
            // previous depth count
            pDepth: number;
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

        const stack: StackItem[] = [{ nodeIdx: 0, pos: 0, pDepth: -1 }];

        let nodeIdx = 0;
        let depth = 0;

        const insertChar = (char: string) => {
            if (!nodes[nodeIdx]) {
                refNodes.push(nodeIdx);
            }
            // console.warn('insertChar %o', { nodeIdx, depth, char });
            const pDepth = depth;
            const utf8Seq = this.letterToUtf8Seq(char);
            for (let i = 0; i < utf8Seq.length; ++i) {
                insertCharIndexes(utf8Seq[i], pDepth);
            }
        };

        /**
         * A single character can result in multiple nodes being created
         * because it takes multiple bytes to represent a character.
         * @param seq - partial character index.
         */
        const insertCharIndexes = (seq: number, pDepth: number) => {
            // console.warn('i %o at %o', char, nodeIdx);
            if (nodes[nodeIdx] && Object.isFrozen(nodes[nodeIdx])) {
                nodeIdx = nodes.push([...nodes[nodeIdx]]) - 1;
                // fix parent
                const { pos, nodeIdx: pNodeIdx } = stack[depth];
                const pNode = nodes[pNodeIdx];
                // console.warn('fix parent %o', { pNode, pos, pNodeIdx });
                pNode[pos] = (pNode[pos] & LetterMask) | (nodeIdx << NodeChildRefShift);
            }
            const node = nodes[nodeIdx] || [0];
            nodes[nodeIdx] = node;
            const hasIdx = childPos(node, seq);
            const childIdx = hasIdx ? node[hasIdx] >>> NodeChildRefShift : nodes.length;
            const pos = hasIdx || node.push((childIdx << NodeChildRefShift) | seq) - 1;
            ++depth;
            const s = stack[depth];
            if (s) {
                s.nodeIdx = nodeIdx;
                s.pos = pos;
                s.pDepth = pDepth;
            } else {
                stack[depth] = { nodeIdx, pos, pDepth };
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

        const reference = (refId: number) => {
            const refNodeIdx = refNodes[refId];
            assert(refNodeIdx !== undefined);
            // console.warn('r %o', { refId, nodeIdx, refNodeIdx, depth });
            assert(nodes[nodeIdx] === undefined);
            assert(nodes[refNodeIdx]);
            Object.freeze(nodes[refNodeIdx]);
            const s = stack[depth];
            nodeIdx = s.nodeIdx;
            const pos = s.pos;
            const node = nodes[nodeIdx];
            node[pos] = (refNodeIdx << NodeChildRefShift) | (node[pos] & LetterMask);
        };

        const backStep = (num: number) => {
            if (!num) return;
            // console.warn('<< %o', num);
            assert(num <= depth && num > 0);
            for (let n = num; n > 0; --n) {
                depth = stack[depth].pDepth;
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
        const utf8Seq = this.wordToUtf8Seq(word);
        const len = utf8Seq.length;
        let nodeIdx = 0;
        for (let p = 0; p < len; ++p) {
            const seq = utf8Seq[p];
            const node = nodes[nodeIdx];
            const count = node.length;
            let i = count - 1;
            for (; i > 0; --i) {
                if ((node[i] & NodeMaskChildCharIndex) === seq) {
                    break;
                }
            }
            if (i > 0) {
                nodeIdx = node[i] >>> NodeChildRefShift;
                if (nodeIdx === 1 && p < len - 1) {
                    nodeIdx = this.nodes.push([NodeMaskEOW]) - 1;
                    node[i] = (nodeIdx << NodeChildRefShift) | seq;
                }
                continue;
            }

            // Not found, add a new node if it isn't the end of the word.
            nodeIdx = p < len - 1 ? this.nodes.push([0]) - 1 : IdxEOW;
            node.push((nodeIdx << NodeChildRefShift) | seq);
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
        const charIndexes = this.wordToUtf8Seq(word);
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
            new FastTrieBlobInternals(
                sortNodes(
                    this.nodes.map((n) => Uint32Array.from(n)),
                    this.bitMasksInfo.NodeMaskChildCharIndex,
                ),
                this.charIndex.build(),
                this.bitMasksInfo,
            ),
            this.options,
        );
    }

    toJSON() {
        return {
            options: this.options,
            nodes: nodesToJSON(this.nodes.map((n) => Uint32Array.from(n))),
        };
    }

    #assertNotReadonly(): void {
        assert(!this.isReadonly(), 'FastTrieBlobBuilder is readonly');
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
            const indexSeq = tf.letterToUtf8Seq(char);
            assertValidUtf16Character(char);
            // console.error('addCharToNode %o', { char, indexSeq });
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
