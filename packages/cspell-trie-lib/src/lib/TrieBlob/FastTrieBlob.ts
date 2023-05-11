import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { TrieBlob } from './TrieBlob.js';

type FastTrieBlobNode = number[];
const NodeMaskEOW = TrieBlob.NodeMaskEOW;
// const NodeMaskNumChildren = 0x000000ff;
const NodeChildRefShift = TrieBlob.NodeChildRefShift;
const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;

export class FastTrieBlob {
    private charToIndexMap: Record<string, number> = Object.create(null);
    private charIndex: string[] = [''];
    private nodes: FastTrieBlobNode[] = [[0], [NodeMaskEOW]];
    private _readonly = false;

    private lookUpCharIndex(char: string): number {
        return this.charToIndexMap[char] ?? -1;
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

    has(word: string): boolean {
        const nodes = this.nodes;
        const len = word.length;
        let nodeIdx = 0;
        let node = nodes[nodeIdx];
        for (let p = 0; p < len; ++p, node = nodes[nodeIdx]) {
            const letterIdx = this.lookUpCharIndex(word[p]);
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

    private _insert(word: string): this {
        word = word.trim();
        if (!word) return this;
        const IdxEOW = 1;
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

            nodeIdx = p < len - 1 ? this.nodes.push([0]) - 1 : IdxEOW;
            node.push((nodeIdx << NodeChildRefShift) | letterIdx);
        }

        return this;
    }

    *words(): Iterable<string> {
        interface StackItem {
            nodeIdx: number;
            pos: number;
            word: string;
        }
        const nodes = this.nodes;
        const stack: StackItem[] = [{ nodeIdx: 0, pos: 0, word: '' }];
        let depth = 0;

        while (depth >= 0) {
            const { nodeIdx, pos, word } = stack[depth];
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
            const letter = this.charIndex[charIdx];
            ++depth;
            stack[depth] = {
                nodeIdx: entry >>> NodeChildRefShift,
                pos: 0,
                word: word + letter,
            };
        }
    }

    toTrieBlob(): TrieBlob {
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
            binNodes[offset++] = (node.length << lenShift) | node[0];
            for (let j = 1; j < node.length; ++j) {
                const v = node[j];
                const nodeRef = v >>> NodeChildRefShift;
                const charIndex = v & NodeMaskChildCharIndex;
                binNodes[offset++] = (nodeToIndex[nodeRef] << refShift) | charIndex;
            }
        }

        return new TrieBlob(binNodes, this.charIndex);
    }

    isReadonly(): boolean {
        return this._readonly;
    }

    freeze(): this {
        this._readonly = true;
        return this;
    }

    static fromWordList(words: string[] | Iterable<string>): FastTrieBlob {
        const ft = new FastTrieBlob();
        return ft.insert(words);
    }

    static fromTrieRoot(root: TrieRoot): FastTrieBlob {
        const tf = new FastTrieBlob();
        const IdxEOW = 1;

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

        return tf.freeze();
    }
}

function resolveMap<K, V>(map: Map<K, V>, key: K, resolve: (key: K) => V): V {
    const r = map.get(key);
    if (r !== undefined) return r;
    const v = resolve(key);
    map.set(key, v);
    return v;
}
