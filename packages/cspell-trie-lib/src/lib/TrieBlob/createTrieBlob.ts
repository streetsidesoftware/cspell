import type { ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import { resolveMap } from './resolveMap.js';
import { TrieBlob } from './TrieBlob.js';

export function createTrieBlob(words: string[]): TrieBlob {
    const ft = FastTrieBlob.fromWordList(words);
    return ft.toTrieBlob();
}

export function createTrieBlobFromTrieRoot(root: ITrieNodeRoot): TrieBlob {
    const NodeMaskEOW = TrieBlob.NodeMaskEOW;
    const NodeChildRefShift = TrieBlob.NodeChildRefShift;
    const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
    const nodes: number[] = [];
    const charIndex: string[] = [''];
    const charMap: Record<string, number> = Object.create(null);
    const known = new Map<ITrieNode, number>();

    known.set(root, appendNode(root));
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

    function resolveNode(n: ITrieNode): number {
        if (n.eow && !n.hasChildren()) return IdxEOW;
        return appendNode(n);
    }

    function walk(n: ITrieNode): number {
        const found = known.get(n);
        if (found) return found;
        const nodeIdx = resolveMap(known, n, resolveNode);
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
