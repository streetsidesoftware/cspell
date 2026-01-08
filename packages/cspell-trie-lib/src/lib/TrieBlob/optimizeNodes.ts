import { type StringTable, StringTableBuilder } from '../StringTable/StringTable.ts';
import { measurePerf } from '../utils/performance.ts';
import {
    NodeHeaderEOWMask,
    NodeHeaderPrefixMask,
    NodeHeaderPrefixShift,
    NodeMaskCharByte,
    type TrieBlobNode32,
} from './TrieBlobFormat.ts';

const MAX_AUTO_ADD_TO_STRING_TABLE = 4;

type TrieBlobNode = number[] | TrieBlobNode32;
type TrieBlobNodes<NodeType extends TrieBlobNode = TrieBlobNode> = NodeType[];

/**
 * Convert from a Trie to a DAWG by merging identical nodes.
 * @param nodes - the nodes to optimize. This array and the contents WILL BE CHANGED and used as a scratch space.
 * @returns the optimized nodes.
 */
export function optimizeNodes<NodeType extends TrieBlobNode>(nodes: TrieBlobNodes<NodeType>): TrieBlobNodes<NodeType> {
    const endPerf = measurePerf('TrieBlob.optimizeNodes');
    /** the has map to look up locked nodes. */
    const nodeHashMap: Map<number, NodeType[]> = new Map();
    const lockedNodes: WeakMap<NodeType, number> = new WeakMap();

    const eowNode = nodes[1];
    getHashList(eowNode).push(eowNode);
    lockNode(eowNode, 1); // Add the EOW node to the locked set.

    walk(0);

    // return nodes;
    const n = compactNodes(nodes);
    endPerf();
    return n;

    function getHashList(node: NodeType): NodeType[] {
        const hash = xorNode(node);
        let list = nodeHashMap.get(hash);
        if (list) return list;
        list = [];
        nodeHashMap.set(hash, list);
        return list;
    }

    function lockNode(node: NodeType, index: number): number {
        lockedNodes.set(node, index);
        return index;
    }

    function findMatchingLockedNode(hash: number, node: NodeType): NodeType | undefined {
        const candidates = nodeHashMap.get(hash);
        if (!candidates) return undefined;
        return findMatchingNode(node, candidates);
    }

    function registerNode(nodeIdx: number, node: NodeType): number {
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

function xorNode(a: TrieBlobNode): number {
    let xor = 0;
    for (let i = 0; i < a.length; ++i) {
        xor ^= a[i];
    }
    return xor;
}

function findMatchingNode<T extends TrieBlobNode>(node: T, candidates: T[]): T | undefined {
    for (let i = candidates.length - 1; i >= 0; --i) {
        const candidate = candidates[i];
        if (compareNodes(node, candidate)) {
            return candidate;
        }
    }
    return undefined;
}

function compareNodes(a: TrieBlobNode, b: TrieBlobNode): boolean {
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
function compactNodes<T extends TrieBlobNode>(nodes: TrieBlobNodes<T>): TrieBlobNodes<T> {
    const nodeMap: Map<number, number> = new Map();
    const compacted: TrieBlobNodes<T> = [];

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
    nodes: TrieBlobNodes;
    stringTable: StringTable;
}

interface NodesAndStringTableBuilder {
    nodes: TrieBlobNodes;
    stringTableBuilder: StringTableBuilder;
}

export function calculateByteSize(nodes: TrieBlobNode[]): number {
    let count = 0;
    for (let i = nodes.length - 1; i >= 0; --i) {
        count += nodes[i].length;
    }
    return count * 4; // each entry is 4 bytes
}

function copyNodes(nodes: TrieBlobNodes): TrieBlobNodes {
    const size = calculateByteSize(nodes);
    const dst: TrieBlobNodes = Array(nodes.length);
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
    const endPerf = measurePerf('TrieBlob.optimizeNodesWithStringTable');

    const { nodes, stringTableBuilder: builder } = copyNodesAndStringTable(src);
    const multipleNodeRefs = calcHasMultipleReferences(nodes);
    const multiStringRefs = new Set<number>([0]);

    if (!builder.length) {
        // Add the empty string to take up index 0.
        builder.addString('');
    }

    walkNodes(nodes, 0, { after: processNode });

    const r = { nodes: optimizeNodes(nodes), stringTable: builder.build() };
    endPerf();
    return r;

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
        const childIdx = childEntry >>> 8;
        // We cannot merge with a child node that has multiple references.
        if (multipleNodeRefs.has(childIdx)) return;
        const childNode = nodes[childIdx];

        const childHeader = childNode[0];
        const childPrefixIdx = (childHeader & NodeHeaderPrefixMask) >>> NodeHeaderPrefixShift;
        const childBytes = builder.getEntry(childPrefixIdx) || [];
        if (!multiStringRefs.has(childPrefixIdx)) {
            multiStringRefs.add(childPrefixIdx);
            if (childBytes.length >= MAX_AUTO_ADD_TO_STRING_TABLE) return;
        }
        const prefixBytes = [charByte, ...childBytes];
        const prefixIdx = builder.addStringBytes(prefixBytes);

        const newNode = Uint32Array.from(childNode);
        newNode[0] = (prefixIdx << NodeHeaderPrefixShift) | (childHeader & ~NodeHeaderPrefixMask);
        nodes[nodeIdx] = newNode;
    }
}

function calcHasMultipleReferences(nodes: TrieBlobNodes): Set<number> {
    const seen = new Set<number>();
    const multiple = new Set<number>();

    walkNodes(nodes, 0, {
        before: (nodeIdx) => {
            if (seen.has(nodeIdx)) {
                multiple.add(nodeIdx);
                return true;
            }
            seen.add(nodeIdx);
            return false;
        },
    });

    return multiple;
}

interface NodeWalkOptions {
    /**
     * @param nodeIdx
     */
    after?: (nodeIdx: number) => void;
    /**
     * @param nodeIdx
     * @returns true to stop going deeper.
     */
    before?: (nodeIdx: number) => boolean | undefined;
}

function walkNodes(nodes: TrieBlobNodes, nodeIdx: number, options: NodeWalkOptions): void {
    const after = options.after || (() => undefined);
    const before = options.before || (() => undefined);

    function walk(nodeIdx: number): void {
        if (before(nodeIdx)) return;

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
