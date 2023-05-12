import type { TrieNode, TrieRoot } from '../TrieNode/TrieNode.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import { resolveMap } from './resolveMap.js';
import { TrieBlob } from './TrieBlob.js';

export function createTrieBlob(words: string[]): TrieBlob {
    const ft = FastTrieBlob.fromWordList(words);
    return ft.toTrieBlob();
}

export function createTrieBlobFromTrieRoot(root: TrieRoot): TrieBlob {
    const NodeMaskEOW = TrieBlob.NodeMaskEOW;
    const NodeChildRefShift = TrieBlob.NodeChildRefShift;
    const NodeMaskNumChildren = TrieBlob.NodeMaskNumChildren;
    const nodes: number[] = [];
    const charIndex: string[] = [''];
    const charMap: Record<string, number> = Object.create(null);
    const known = new Map<TrieNode, number>();

    known.set(root, appendNode(root));
    const IdxEOW = appendNode({ f: 1 });

    function getCharIndex(char: string): number {
        const idx = charMap[char];
        if (idx) return idx;
        const newIdx = charIndex.push(char) - 1;
        charMap[char.normalize('NFC')] = newIdx;
        charMap[char.normalize('NFD')] = newIdx;
        return newIdx;
    }

    function appendNode(n: TrieNode): number {
        const idx = nodes.push(n.f ? NodeMaskEOW : 0) - 1;
        if (n.c) {
            const keys = Object.keys(n.c).map((key) => getCharIndex(key));
            nodes[idx] = nodes[idx] | (keys.length & NodeMaskNumChildren);
            nodes.push(...keys);
        }
        return idx;
    }

    function resolveNode(n: TrieNode): number {
        if (n.f && !n.c) return IdxEOW;
        return appendNode(n);
    }

    function walk(n: TrieNode): number {
        const found = known.get(n);
        if (found) return found;
        const nodeIdx = resolveMap(known, n, resolveNode);
        if (!n.c) return nodeIdx;
        const children = Object.values(n.c);
        for (let p = 0; p < children.length; ++p) {
            const childNode = children[p];
            const childIdx = walk(childNode);
            // Nodes already have the letters, just OR in the child index.
            nodes[nodeIdx + p + 1] |= childIdx << NodeChildRefShift;
        }
        return nodeIdx;
    }

    walk(root);

    return new TrieBlob(Uint32Array.from(nodes), charIndex, root);
}
