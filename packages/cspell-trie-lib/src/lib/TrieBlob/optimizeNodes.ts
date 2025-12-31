import { type StringTable, StringTableBuilder } from '../StringTable/StringTable.ts';
import {
    type FastTrieBlobNodes32,
    NodeHeaderEOWMask,
    NodeHeaderPrefixMask,
    NodeHeaderPrefixShift,
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
    for (let i = 0; i < a.length && diff === 0; ++i) {
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

interface NodesAndStringTable {
    nodes: FastTrieBlobNodes32;
    stringTable: StringTable;
}

interface NodesAndStringTableBuilder {
    nodes: FastTrieBlobNodes32;
    stringTableBuilder: StringTableBuilder;
}

export function calculateByteSize(nodes: FastTrieBlobNodes32): number {
    let count = 0;
    for (let i = nodes.length - 1; i >= 0; --i) {
        count += nodes[i].length;
    }
    return count * 4; // each entry is 4 bytes
}

function copyNodes(nodes: FastTrieBlobNodes32): FastTrieBlobNodes32 {
    const size = calculateByteSize(nodes);
    const dst: FastTrieBlobNodes32 = Array(nodes.length);
    const buffer = new ArrayBuffer(size);

    for (let i = 0, offset = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        const nodeCopy = new Uint32Array(buffer, offset, node.length);
        nodeCopy.set(node);
        dst[i] = nodeCopy;
        offset += nodeCopy.byteLength;
    }

    return dst;
}

function copyNodesAndStringTable(src: NodesAndStringTable): NodesAndStringTableBuilder {
    const nodes = copyNodes(src.nodes);
    const stringTableBuilder = StringTableBuilder.fromStringTable(src.stringTable);
    return { nodes, stringTableBuilder };
}

export function optimizeNodesWithStringTable(src: NodesAndStringTable): NodesAndStringTable {
    const { nodes, stringTableBuilder: builder } = copyNodesAndStringTable(src);

    if (!builder.length) {
        // Add the empty string to take up index 0.
        builder.addString('');
    }

    walkNodes(nodes, 0, { after: processNode });

    return { nodes: optimizeNodes(nodes), stringTable: builder.build() };

    /**
     * If possible, replace the current node with a prefix node.
     * @param nodeIdx - node to process
     */
    function processNode(nodeIdx: number): void {
        const node = nodes[nodeIdx];
        if (node.length !== 2) return;
        const header = node[0];
        // An end of word node cannot be merged with a prefix.
        if ((header & NodeHeaderEOWMask) !== 0) return;
        // Already has a prefix, skip.
        if (header & NodeHeaderPrefixMask) return;

        const childEntry = node[1];
        const charByte = childEntry & NodeMaskCharByte;
        const childNode = nodes[childEntry >>> 8];

        const childHeader = childNode[0];
        const childPrefixIdx = (childHeader & NodeHeaderPrefixMask) >>> NodeHeaderPrefixShift;
        const childBytes = builder.getEntry(childPrefixIdx) || [];
        const prefixBytes = [charByte, ...childBytes];
        const prefixIdx = builder.addStringBytes(prefixBytes);

        const newNode = new Uint32Array(childNode);
        newNode[0] = (prefixIdx << NodeHeaderPrefixShift) | (childHeader & ~NodeHeaderPrefixMask);
        nodes[nodeIdx] = newNode;
    }
}

interface NodeWalkOptions {
    after?: (nodeIdx: number) => void;
    before?: (nodeIdx: number) => void;
}

function walkNodes(nodes: FastTrieBlobNodes32, nodeIdx: number, options: NodeWalkOptions): void {
    const after = options.after || (() => undefined);
    const before = options.before || (() => undefined);

    function walk(nodeIdx: number): void {
        before(nodeIdx);

        const node = nodes[nodeIdx];
        const count = node.length - 1;

        for (let i = 1; i <= count; ++i) {
            const entry = node[i];
            const childIdx = entry >> 8;
            walk(childIdx);
        }

        after(nodeIdx);
    }

    walk(nodeIdx);
}
