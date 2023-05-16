import type { PartialTrieOptions, TrieOptions } from '../ITrieNode/TrieOptions.js';
import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import type { BuilderCursor } from './BuilderCursor.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import type { FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';
import { FastTrieBlobInternals } from './FastTrieBlobInternals.js';
import { resolveMap } from './resolveMap.js';
import { TrieBlob } from './TrieBlob.js';

type FastTrieBlobNode = number[];

export class FastTrieBlobBuilder {
    private charToIndexMap: Record<string, number> = Object.create(null);
    private charIndex: string[] = [''];
    private nodes: FastTrieBlobNode[];
    private _readonly = false;
    private IdxEOW: number;
    private _cursor: BuilderCursor | undefined;

    readonly options: Readonly<TrieOptions>;
    readonly bitMasksInfo: FastTrieBlobBitMaskInfo;

    constructor(options?: PartialTrieOptions, bitMasksInfo = FastTrieBlobBuilder.DefaultBitMaskInfo) {
        this.options = mergeOptionalWithDefaults(options);
        this.bitMasksInfo = bitMasksInfo;
        this.nodes = [[0], Object.freeze([FastTrieBlobBuilder.NodeMaskEOW]) as number[]];
        this.IdxEOW = 1;
    }

    private getCharIndex(char: string): number {
        let idx = this.charToIndexMap[char];
        if (idx) return idx;

        const charNFC = char.normalize('NFC');
        const charNFD = char.normalize('NFD');

        idx = this.charIndex.push(charNFC) - 1;

        this.charToIndexMap[charNFC] = idx;
        this.charToIndexMap[charNFD] = idx;

        return idx;
    }

    insert(word: string | Iterable<string> | string[]): this {
        if (this.isReadonly()) {
            throw new Error('FastTrieBlob is readonly');
        }
        if (typeof word === 'string') {
            return this._insert(word);
        }
        const words = word;

        if (Array.isArray(words)) {
            for (let i = 0; i < words.length; ++i) {
                this._insert(words[i]);
            }
            return this;
        }

        for (const w of words) {
            this._insert(w);
        }
        return this;
    }

    get cursor(): BuilderCursor {
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
        }

        assert(this.nodes.length === 2);
        const eow = 1;
        const eowShifted = eow << NodeChildRefShift;
        const nodes = this.nodes;

        const stack: StackItem[] = [{ nodeIdx: 0, pos: 0 }];

        let nodeIdx = 0;
        let depth = 0;

        const insertChar = (char: string) => {
            // console.warn('i %o', char);
            const node = nodes[nodeIdx] ?? [0];
            nodes[nodeIdx] = node;
            const childIdx = nodes.length;
            const letterIdx = this.getCharIndex(char);
            const pos = node.push((childIdx << NodeChildRefShift) | letterIdx) - 1;
            ++depth;
            const s = stack[depth];
            if (s) {
                s.nodeIdx = nodeIdx;
                s.pos = pos;
            } else {
                stack[depth] = { nodeIdx, pos };
            }
            nodeIdx = childIdx;
        };

        const markEOW = () => {
            // console.warn('$');
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
        };

        const reference = (nodeId: number) => {
            // +1 is used because the EOW node was already added, but not counted.
            const refNodeIdx = nodeId + 1;
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
            // console.warn('<< %o', num);
            assert(num <= depth && num > 0);
            depth -= num;
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
        const len = word.length;
        let nodeIdx = 0;
        for (let p = 0; p < len; ++p) {
            const letterIdx = this.getCharIndex(word[p]);
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

        return this;
    }

    has(word: string): boolean {
        const NodeMaskChildCharIndex = this.bitMasksInfo.NodeMaskChildCharIndex;
        const NodeChildRefShift = this.bitMasksInfo.NodeChildRefShift;
        const NodeMaskEOW = this.bitMasksInfo.NodeMaskEOW;
        const nodes = this.nodes;
        const len = word.length;
        let nodeIdx = 0;
        let node = nodes[nodeIdx];
        for (let p = 0; p < len; ++p, node = nodes[nodeIdx]) {
            const letterIdx = this.charToIndexMap[word[p]];
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
        this.freeze();
        Object.freeze(this.nodes);

        return FastTrieBlob.create(
            new FastTrieBlobInternals(this.nodes, this.charIndex, this.charToIndexMap, this.bitMasksInfo),
            this.options
        );
    }

    static fromWordList(words: string[] | Iterable<string>): FastTrieBlob {
        const ft = new FastTrieBlobBuilder();
        return ft.insert(words).build();
    }

    static fromTrieRoot(root: TrieRoot): FastTrieBlob {
        const bitMasksInfo = FastTrieBlobBuilder.DefaultBitMaskInfo;
        const NodeChildRefShift = bitMasksInfo.NodeChildRefShift;
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
            node.length = children.length + 1;
            for (let p = 0; p < children.length; ++p) {
                const [char, childNode] = children[p];
                const letterIdx = tf.getCharIndex(char);
                const childIdx = walk(childNode);
                node[p + 1] = (childIdx << NodeChildRefShift) | letterIdx;
            }
            return nodeIdx;
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

function assert<T>(condition: T, message = 'Assert Failed'): asserts condition {
    if (condition) return;
    throw new Error(message);
}
