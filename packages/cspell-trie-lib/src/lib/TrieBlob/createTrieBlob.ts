import assert from 'node:assert';

import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { PartialTrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieData } from '../TrieData.js';
import { CharIndexBuilder } from './CharIndex.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';
import { resolveMap } from './resolveMap.js';
import { TrieBlob } from './TrieBlob.js';

export function createTrieBlob(words: readonly string[], options?: PartialTrieInfo): TrieBlob {
    const ft = FastTrieBlobBuilder.fromWordList(words, options);
    return ft.toTrieBlob();
}

export function createTrieBlobFromITrieNodeRoot(root: ITrieNodeRoot): TrieBlob {
    const charIndexBuilder = new CharIndexBuilder();
    const NodeMaskEOW = TrieBlob.NodeMaskEOW;
    const NodeChildRefShift = TrieBlob.NodeChildRefShift;
    const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
    const NodeMaskChildCharIndex = TrieBlob.NodeMaskChildCharIndex;
    const nodes: number[] = [];
    const known = new Map<ITrieNodeId, number>();

    known.set(root.id, appendNode(root));
    const IdxEOW = nodes.push(NodeMaskEOW) - 1;

    function getCharIndex(char: string): number {
        const idx = charIndexBuilder.charToSequence(char);
        assert(idx.length === 1);
        return idx[0];
    }

    function appendNode(n: ITrieNode): number {
        const idx = nodes.push(n.eow ? NodeMaskEOW : 0) - 1;
        if (n.hasChildren()) {
            const keys = n.keys().map((key) => getCharIndex(key));
            nodes[idx] = nodes[idx] | (keys.length & NodeMaskNumChildren);
            nodes.push(...keys);
        }
        return idx;
    }

    function resolveNode(id: ITrieNodeId): number {
        const n = root.resolveId(id);
        if (n.eow && !n.hasChildren()) return IdxEOW;
        return appendNode(n);
    }

    function sortChildren(idx: number) {
        const n = nodes[idx];
        if (!n) return;
        const numChildren = n & NodeMaskNumChildren;
        if (!numChildren) return;
        const mask = NodeMaskChildCharIndex;
        const start = idx + 1;
        const end = start + numChildren;
        const sorted = nodes.slice(start, end).sort((a, b) => (a & mask) - (b & mask));
        sorted.forEach((v, i) => (nodes[start + i] = v));
    }

    function walk(n: ITrieNode): number {
        const found = known.get(n.id);
        if (found) return found;
        const nodeIdx = resolveMap(known, n.id, resolveNode);
        if (!n.hasChildren()) return nodeIdx;
        const cnIdx = nodeIdx + 1;
        const children = n.values();
        let needsSort = false;
        let last = 0;
        for (let p = 0; p < children.length; ++p) {
            const childNode = children[p];
            const childIdx = walk(childNode);
            // Nodes already have the letters, just OR in the child index.
            const n = nodes[cnIdx + p];
            needsSort = needsSort || last >= n;
            last = n;
            nodes[cnIdx + p] |= childIdx << NodeChildRefShift;
        }
        needsSort && sortChildren(nodeIdx);
        return nodeIdx;
    }

    walk(root);

    return new TrieBlob(new Uint32Array(nodes), charIndexBuilder.build(), root.info);
}

export function createTrieBlobFromTrieData(trie: TrieData): TrieBlob {
    return createTrieBlobFromITrieNodeRoot(trie.getRoot());
}
