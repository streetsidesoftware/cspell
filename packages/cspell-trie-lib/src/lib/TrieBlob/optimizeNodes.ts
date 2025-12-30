import { type StringTable, StringTableBuilder } from '../StringTable/StringTable.ts';
import {
    type FastTrieBlobNodes32,
    NodeHeaderEOWMask,
    NodeMaskCharByte,
    type TrieBlobNode32,
} from './TrieBlobFormat.ts';

/**
 * Convert from a Trie to a DAWG by merging identical nodes.
 * @param nodes - the nodes to optimize. This array and the contents WILL BE CHANGED and used as a scratch space.
 * @returns the optimized nodes.
 */

export function optimizeNodes(nodes: FastTrieBlobNodes32): FastTrieBlobNodes32 {
    /** the has map to look up locked nodes. */
    const nodeHashMap: Map<number, TrieBlobNode32[]> = new Map();
    const lockedNodes: WeakMap<TrieBlobNode32, number> = new WeakMap();

    const eowNode = nodes[1];
    getHashList(eowNode).push(eowNode);
    lockNode(eowNode, 1); // Add the EOW node to the locked set.

    walk(0);

    // return nodes;
    return compactNodes(nodes);

    function getHashList(node: TrieBlobNode32): TrieBlobNode32[] {
        const hash = xorNode(node);
        let list = nodeHashMap.get(hash);
        if (list) return list;
        list = [];
        nodeHashMap.set(hash, list);
        return list;
    }

    function lockNode(node: TrieBlobNode32, index: number): number {
        lockedNodes.set(node, index);
        return index;
    }

    function findMatchingLockedNode(hash: number, node: TrieBlobNode32): TrieBlobNode32 | undefined {
        const candidates = nodeHashMap.get(hash);
        if (!candidates) return undefined;
        return findMatchingNode(node, candidates);
    }

    function registerNode(nodeIdx: number, node: TrieBlobNode32): number {
        // Do not change the root node.
        if (!nodeIdx) return nodeIdx;

        const hash = xorNode(node);
        const match = findMatchingLockedNode(hash, node);

        if (!match) {
            getHashList(node).push(node);
            return lockNode(node, nodeIdx);
        }

        const matchIdx = lockedNodes.get(match) || 0;
        return lockNode(node, matchIdx);
    }

    function walk(nodeIdx: number): number {
        const node = nodes[nodeIdx];
        if (lockedNodes.has(node)) {
            return nodeIdx;
        }
        const count = node.length - 1;
        for (let i = 1; i <= count; ++i) {
            const entry = node[i];
            const childIdx = entry >> 8;
            const newChildIdx = walk(childIdx);
            if (newChildIdx !== childIdx) {
                node[i] = (entry & 0xff) | (newChildIdx << 8);
            }
        }
        return registerNode(nodeIdx, node);
    }
}

function xorNode(a: TrieBlobNode32): number {
    let xor = 0;
    for (let i = 0; i < a.length; ++i) {
        xor ^= a[i];
    }
    return xor;
}

function findMatchingNode(node: TrieBlobNode32, candidates: TrieBlobNode32[]): TrieBlobNode32 | undefined {
    for (let i = candidates.length - 1; i >= 0; --i) {
        const candidate = candidates[i];
        if (compareNodes(node, candidate)) {
            return candidate;
        }
    }
    return undefined;
}

function compareNodes(a: TrieBlobNode32, b: TrieBlobNode32): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length && diff == 0; ++i) {
        diff = a[i] - b[i];
    }
    return !diff;
}

/**
 * Walk the trie and remove any nodes that are not reachable.
 * @param nodes - the nodes to compact they will get modified.
 * @returns the compacted nodes.
 */
function compactNodes(nodes: FastTrieBlobNodes32): FastTrieBlobNodes32 {
    const nodeMap: Map<number, number> = new Map();
    const compacted: FastTrieBlobNodes32 = [];

    nodeMap.set(0, 0);
    nodeMap.set(1, 1);
    compacted.push(nodes[0], nodes[1]);

    walk(0);

    return compacted;

    function walk(nodeIdx: number): number {
        const found = nodeMap.get(nodeIdx);
        // Note: we do NOT want to return if found is 0, since we need to process the root node.
        if (found) return found;

        const node = nodes[nodeIdx];
        const count = node.length - 1;
        for (let i = 1; i <= count; ++i) {
            const entry = node[i];
            const childIdx = entry >> 8;
            const newChildIdx = walk(childIdx);
            // no need to check for change, we are rebuilding the node.
            node[i] = (entry & 0xff) | (newChildIdx << 8);
        }

        if (!nodeIdx) return nodeIdx;

        const newIndex = compacted.push(node) - 1;
        nodeMap.set(nodeIdx, newIndex);
        return newIndex;
    }
}

interface PfxStackItem {
    charCodes: number[];
    nodeIdx: number;
    endIdx: number;
}

export function extractStringTable<T extends number[] | Uint32Array>(nodes: T[]): StringTable {
    const builder = new StringTableBuilder();
    const seen: Set<number> = new Set();
    const eowMask = NodeHeaderEOWMask;
    const mask = NodeMaskCharByte;

    const pfxStack: (PfxStackItem | undefined)[] = [];

    function getCount(node: T): number {
        return node.length - 1;
    }

    function nodeIsEOW(node: T): boolean {
        return (node[0] & eowMask) !== 0;
    }

    function processNode(nodeIdx: number, depth: number): void {
        const node = nodes[nodeIdx];
        const count = getCount(node);
        const isEow = nodeIsEOW(node);
        const endOfPfx = isEow || count > 1;
        const curPfx = pfxStack[depth - 1];
        pfxStack[depth] = undefined;

        if (endOfPfx) {
            if (curPfx) {
                curPfx.endIdx = nodeIdx;
                emitPrefix(curPfx);
            }
            return;
        }

        if (count !== 1) return;

        const pfx = curPfx || { charCodes: [], nodeIdx: nodeIdx, endIdx: nodeIdx };
        pfx.charCodes.push(node[1] & mask);
        pfxStack[depth] = pfx;
    }

    function emitPrefix(pfxStackItem: PfxStackItem): void {
        if (seen.has(pfxStackItem.nodeIdx)) return;

        builder.addStringBytes(pfxStackItem.charCodes);
        seen.add(pfxStackItem.nodeIdx);
    }

    function walk(nodeIdx: number, depth: number): void {
        processNode(nodeIdx, depth);
        const node = nodes[nodeIdx];
        const count = getCount(node);
        for (let i = 1; i <= count; ++i) {
            const childIdx = node[i] >> 8;
            walk(childIdx, depth + 1);
        }
    }

    walk(0, 0);

    return builder.build();
}
