import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { PartialTrieOptions } from '../ITrieNode/TrieOptions.js';
import type { TrieData } from '../TrieData.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';
import { resolveMap } from './resolveMap.js';
import { TrieBlob } from './TrieBlob.js';

export function createTrieBlob(words: string[], options?: PartialTrieOptions): TrieBlob {
    const ft = FastTrieBlobBuilder.fromWordList(words, options);
    return ft.toTrieBlob();
}

export function createTrieBlobFromITrieNodeRoot(root: ITrieNodeRoot): TrieBlob {
    const NodeMaskEOW = TrieBlob.NodeMaskEOW;
    const NodeChildRefShift = TrieBlob.NodeChildRefShift;
    const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
    const nodes: number[] = [];
    const charIndex: string[] = [''];
    const charMap: Record<string, number> = Object.create(null);
    const known = new Map<ITrieNodeId, number>();

    known.set(root.id, appendNode(root));
    const IdxEOW = nodes.push(NodeMaskEOW) - 1;

    function getCharIndex(char: string): number {
        const idx = charMap[char];
        if (idx) return idx;
        const newIdx = charIndex.push(char) - 1;
        charMap[char.normalize('NFC')] = newIdx;
        charMap[char.normalize('NFD')] = newIdx;
        return newIdx;
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

    function walk(n: ITrieNode): number {
        const found = known.get(n.id);
        if (found) return found;
        const nodeIdx = resolveMap(known, n.id, resolveNode);
        if (!n.hasChildren()) return nodeIdx;
        const children = n.values();
        for (let p = 0; p < children.length; ++p) {
            const childNode = children[p];
            const childIdx = walk(childNode);
            // Nodes already have the letters, just OR in the child index.
            nodes[nodeIdx + p + 1] |= childIdx << NodeChildRefShift;
        }
        return nodeIdx;
    }

    walk(root);

    return new TrieBlob(Uint32Array.from(nodes), charIndex, root.options);
}

export function createTrieBlobFromTrieData(trie: TrieData): TrieBlob {
    return createTrieBlobFromITrieNodeRoot(trie.getRoot());
}
