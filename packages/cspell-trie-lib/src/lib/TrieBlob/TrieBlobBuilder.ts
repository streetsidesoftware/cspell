import type { BuilderCursor, TrieBuilder } from '../Builder/index.ts';
import type { BuildOptions } from '../BuildOptions.ts';
import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/index.ts';
import type { PartialTrieInfo, TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import { normalizeTrieInfo, TrieInfoBuilder } from '../ITrieNode/TrieInfo.ts';
import { StringTableBuilder } from '../StringTable/StringTable.ts';
import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.ts';
import { assert } from '../utils/assert.ts';
import { assertValidUtf16Character } from '../utils/text.ts';
import { CharIndexBuilder } from './CharIndex.ts';
import { optimizeNodes, optimizeNodesWithStringTable } from './optimizeNodes.ts';
import { resolveMap } from './resolveMap.ts';
import type { TrieBlob } from './TrieBlob.ts';
import { NodeChildIndexRefShift, NodeHeaderEOWMask, NodeMaskCharByte } from './TrieBlobFormat.ts';
import { sortNodes, toTrieBlob } from './TrieBuilderUtils.ts';
import { encodeTextToUtf8_32Rev, encodeToUtf8_32Rev } from './Utf8.ts';

type FastTrieBlobNode = number[];

const AutoOptimizeNodeCount = 1000;

export class TrieBlobBuilder implements TrieBuilder<TrieBlob> {
    private charIndex = new CharIndexBuilder();
    private nodes: FastTrieBlobNode[];
    private _readonly = false;
    private IdxEOW: number;
    private _cursor: BuilderCursor | undefined;
    private _cursorId: number = 0;

    wordToCharacters = (word: string): string[] => [...word];

    #infoBuilder: TrieInfoBuilder;

    constructor(options?: PartialTrieInfo, characteristics?: Partial<TrieCharacteristics>) {
        this.nodes = [[0], Object.freeze([NodeHeaderEOWMask]) as number[]];
        this.IdxEOW = 1;
        this.#infoBuilder = new TrieInfoBuilder(options, characteristics);
    }

    setOptions(options: PartialTrieInfo): Readonly<TrieInfo> {
        this.#infoBuilder.setInfo(options);
        return this.#infoBuilder.getActiveInfo();
    }

    get options(): Readonly<TrieInfo> {
        return this.#infoBuilder.getActiveInfo();
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
            return this.#insertWord(word);
        }

        const words = word;

        for (const w of words) {
            this.#insertWord(w);
        }
        return this;
    }

    getCursor(): BuilderCursor {
        this.#assertNotReadonly();
        this._cursor ??= this.createCursor(++this._cursorId);
        return this._cursor;
    }

    private createCursor(id: number): BuilderCursor {
        const nodeChildRefShift = NodeChildIndexRefShift;
        const NodeMaskEOW = NodeHeaderEOWMask;
        const LetterMask = NodeMaskCharByte;
        const refNodes: number[] = [0, 1];
        const lookupCharCode = createCharUtf8_32RevLookup();
        let disposed = false;
        const dispose = () => {
            if (disposed) return;
            disposed = true;
            if (this._cursorId === id) {
                this._cursor = undefined;
            }
        };

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
        const eowNodeIndex = 1;
        const eowShifted = eowNodeIndex << nodeChildRefShift;
        const nodes = this.nodes;

        const stack: StackItem[] = [{ nodeIdx: 0, pos: 0, pDepth: -1 }];

        let nodeIdx = 0;
        let depth = 0;

        /**
         * Asserts that the cursor has not been disposed and is still valid.
         * There can be only one valid cursor per builder at a time.
         */
        const assertNotDisposed = (): void => {
            assert(!disposed, 'Cursor has been disposed');
            assert(id === this._cursorId, 'Cursor is no longer valid');
        };

        /**
         * A single character can result in multiple nodes being created
         * because it takes multiple bytes to represent a character.
         * @param char - character to insert.
         */
        function insertChar(char: string) {
            assertNotDisposed();
            if (!nodes[nodeIdx]) {
                refNodes.push(nodeIdx);
            }
            // console.warn('insertChar %o', { nodeIdx, depth, char });
            const pDepth = depth;

            for (let encoded = lookupCharCode(char); encoded; encoded >>>= 8) {
                insertCharByteCode(encoded & 0xff, pDepth);
            }
        }

        /**
         * A single character can result in multiple nodes being created
         * because it takes multiple bytes to represent a character.
         * @param byte - partial character index.
         */
        function insertCharByteCode(byte: number, pDepth: number) {
            // console.warn('i %o at %o', char, nodeIdx);
            if (nodes[nodeIdx] && Object.isFrozen(nodes[nodeIdx])) {
                nodeIdx = nodes.push([...nodes[nodeIdx]]) - 1;
                // fix parent
                const { pos, nodeIdx: pNodeIdx } = stack[depth];
                const pNode = nodes[pNodeIdx];
                // console.warn('fix parent %o', { pNode, pos, pNodeIdx });
                pNode[pos] = (pNode[pos] & LetterMask) | (nodeIdx << nodeChildRefShift);
            }
            const node = nodes[nodeIdx] || [0];
            nodes[nodeIdx] = node;
            const hasIdx = childPos(node, byte);
            const childIdx = hasIdx ? node[hasIdx] >>> nodeChildRefShift : nodes.length;
            const pos = hasIdx || node.push((childIdx << nodeChildRefShift) | byte) - 1;
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
        }

        function markEOW() {
            assertNotDisposed();
            // console.warn('$');
            if (nodeIdx === eowNodeIndex) return;
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
            nodeIdx = eowNodeIndex;
        }

        function reference(refId: number) {
            assertNotDisposed();
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
            node[pos] = (refNodeIdx << nodeChildRefShift) | (node[pos] & LetterMask);
        }

        function backStep(num: number) {
            assertNotDisposed();
            if (!num) return;
            // console.warn('<< %o', num);
            assert(num <= depth && num > 0);
            for (let n = num; n > 0; --n) {
                depth = stack[depth].pDepth;
            }
            nodeIdx = stack[depth + 1].nodeIdx;
        }

        const c: BuilderCursor = {
            insertChar,
            markEOW,
            reference,
            backStep,
            dispose,
            [Symbol.dispose]: dispose,
        };

        return c;
    }

    #insertWord(word: string): this {
        word = word.trim();
        if (!word) return this;
        this.#infoBuilder.addWord(word);

        const NodeMaskChildCharIndex = NodeMaskCharByte;
        const nodeChildRefShift = NodeChildIndexRefShift;
        const NodeMaskEOW = NodeHeaderEOWMask;
        const IdxEOW = this.IdxEOW;
        const nodes = this.nodes;

        let nodeIdx = 0;
        const wLen = word.length;
        const bytes: number[] = [];

        for (const t = { text: word, i: 0 }; t.i < wLen; ) {
            const isLastChar = t.i >= wLen - 1;
            for (let utf8Code = encodeTextToUtf8_32Rev(t); utf8Code; utf8Code >>>= 8) {
                const seq = utf8Code & 0xff;
                bytes.push(seq);
                const node = nodes[nodeIdx];
                const count = node.length;
                let i = count - 1;
                for (; i > 0; --i) {
                    if ((node[i] & NodeMaskChildCharIndex) === seq) {
                        break;
                    }
                }
                const isEow = isLastChar && utf8Code <= 0xff;
                if (i > 0) {
                    nodeIdx = node[i] >>> nodeChildRefShift;
                    if (nodeIdx === 1 && !isEow) {
                        nodeIdx = this.nodes.push([NodeMaskEOW]) - 1;
                        node[i] = (nodeIdx << nodeChildRefShift) | seq;
                    }
                    continue;
                }

                // Not found, add a new node if it isn't the end of the word.
                nodeIdx = isEow ? IdxEOW : this.nodes.push([0]) - 1;
                node.push((nodeIdx << nodeChildRefShift) | seq);
            }
        }

        if (nodeIdx > 1) {
            // Make sure the EOW is set
            const node = nodes[nodeIdx];
            node[0] |= NodeMaskEOW;
        }

        {
            const utf8Seq = this.wordToUtf8Seq(word);
            assert(utf8Seq.length === bytes.length);
            assert(utf8Seq.join(',') === bytes.join(','));
        }

        return this;
    }

    has(word: string): boolean {
        const NodeMaskChildCharIndex = NodeMaskCharByte;
        const nodeChildRefShift = NodeChildIndexRefShift;
        const NodeMaskEOW = NodeHeaderEOWMask;
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
            nodeIdx = node[i] >>> nodeChildRefShift;
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

    optimize(): this {
        this.#assertNotReadonly();
        this._cursor?.dispose?.();

        return this;
    }

    build(options?: BuildOptions): TrieBlob {
        const { optimize, useStringTable } = options || {};
        this._cursor?.dispose?.();
        this._readonly = true;
        this.freeze();
        const info = this.#infoBuilder.build();
        let sortedNodes = sortNodes(
            this.nodes.map((n) => Uint32Array.from(n)),
            NodeMaskCharByte,
        );

        // Optimize automatically if the node count is small.
        // This will not involve a string table.
        if (optimize || sortNodes.length < AutoOptimizeNodeCount) {
            sortedNodes = optimizeNodes(sortedNodes);
        }

        const stringTable = new StringTableBuilder().build();

        const r = useStringTable
            ? optimizeNodesWithStringTable({ nodes: sortedNodes, stringTable })
            : { nodes: sortedNodes, stringTable };

        // console.log('TrieBlobBuilder.build: %o', {
        //     optimize,
        //     useStringTable,
        //     size: r.nodes.reduce((sum, n) => sum + n.length, 0) * 4,
        //     numNodes: r.nodes.length,
        //     stringNumEntries: r.stringTable.length,
        //     strLenBits: r.stringTable.strLenBits,
        //     stringTableByteSize: r.stringTable.dataByteLength(),
        //     stringTableBitInfo: r.stringTable.bitInfo(),
        // });

        return toTrieBlob(r.nodes, r.stringTable, normalizeTrieInfo(info.info));
    }

    toJSON(): {
        options: Readonly<TrieInfo>;
        nodes: FastTrieBlobNode[];
    } {
        return {
            options: this.options,
            nodes: this.nodes,
        };
    }

    #assertNotReadonly(): void {
        assert(!this.isReadonly(), 'FastTrieBlobBuilder is readonly');
    }

    static fromWordList(
        words: readonly string[] | Iterable<string>,
        options?: PartialTrieInfo,
        buildOptions?: BuildOptions,
    ): TrieBlob {
        const ft = new TrieBlobBuilder(options);
        return ft.insert(words).build(buildOptions);
    }

    /**
     * Create a TrieBlob from a TrieRoot.
     *
     * This is equivalent to, but slightly faster because it avoids creating an ITrieNodes
     * ```ts
     * static fromTrieRoot(root: TrieRoot, optimize?: boolean): TrieBlob {
     *   return this.fromITrieRoot(trieRootToITrieRoot(root), optimize);
     * }
     * ```
     *
     * @param root - TrieRoot
     * @param buildOptions - optional build options
     * @returns TrieBlob
     */
    static fromTrieRoot(root: TrieRoot, buildOptions?: BuildOptions): TrieBlob {
        const NodeCharIndexMask = NodeMaskCharByte;
        const nodeChildRefShift = NodeChildIndexRefShift;
        const NodeMaskEOW = NodeHeaderEOWMask;

        const tf = new TrieBlobBuilder(undefined, root);
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
                    node = tf.nodes[node[pos] >>> nodeChildRefShift];
                } else {
                    const next: FastTrieBlobNode = [0];
                    const nodeIdx = tf.nodes.push(next) - 1;
                    node[pos] = (nodeIdx << nodeChildRefShift) | idx;
                    node = next;
                }
            }
            const letterIdx = indexSeq[indexSeq.length - 1];
            const i = node.push(letterIdx) - 1;
            node[i] = (walk(n) << nodeChildRefShift) | letterIdx;
        }

        walk(root);

        return tf.build(buildOptions);
    }

    /**
     * Create a TrieBlob from a TrieRoot.
     *
     * @param root - root node
     * @param buildOptions - optional build options
     * @returns TrieBlob
     */
    static fromITrieRoot(root: ITrieNodeRoot, buildOptions?: BuildOptions): TrieBlob {
        const NodeCharIndexMask = NodeMaskCharByte;
        const nodeChildRefShift = NodeChildIndexRefShift;
        const NodeMaskEOW = NodeHeaderEOWMask;

        const tf = new TrieBlobBuilder(undefined, root);
        const IdxEOW = tf.IdxEOW;

        const known = new Map<ITrieNodeId, number>([[root.id, 0]]);

        function resolveNode(n: ITrieNode): number {
            if (n.eow && !n.hasChildren()) return IdxEOW;
            const node = [n.eow ? NodeMaskEOW : 0];
            return tf.nodes.push(node) - 1;
        }

        function walk(n: ITrieNode): number {
            const found = known.get(n.id);
            if (found) return found;
            const nodeIdx = resolveMap(known, n.id, () => resolveNode(n));
            const node = tf.nodes[nodeIdx];
            if (!n.hasChildren()) return nodeIdx;
            const children = n.entries();
            for (const [char, childNode] of children) {
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

        function addCharToNode(node: FastTrieBlobNode, char: string, n: ITrieNode): void {
            const indexSeq = tf.letterToUtf8Seq(char);
            assertValidUtf16Character(char);
            // console.error('addCharToNode %o', { char, indexSeq });
            for (const idx of indexSeq.slice(0, -1)) {
                const pos = resolveChild(node, idx);
                if (pos < node.length) {
                    node = tf.nodes[node[pos] >>> nodeChildRefShift];
                } else {
                    const next: FastTrieBlobNode = [0];
                    const nodeIdx = tf.nodes.push(next) - 1;
                    node[pos] = (nodeIdx << nodeChildRefShift) | idx;
                    node = next;
                }
            }
            const letterIdx = indexSeq[indexSeq.length - 1];
            const i = node.push(letterIdx) - 1;
            node[i] = (walk(n) << nodeChildRefShift) | letterIdx;
        }

        walk(root);

        return tf.build(buildOptions);
    }
}

function createCharUtf8_32RevLookup(maxSize: number = 256): (char: string) => number {
    let size = 0;
    let map: Record<string, number> = Object.create(null);

    return (char: string): number => {
        let code = map[char];
        if (!code) {
            size++;
            if (size >= maxSize) {
                size = 1;
                map = Object.create(null);
            }
            code = encodeToUtf8_32Rev(char.codePointAt(0) || 0);
            map[char] = code;
        }
        return code;
    };
}
