import type { PartialTrieInfo, TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.ts';
import type { FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.ts';

type Node = Uint32Array;
type Nodes = Node[];

export class FastTrieBlobInternals implements FastTrieBlobBitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
    readonly info: Readonly<TrieInfo>;
    readonly nodes: Nodes;

    constructor(nodes: Nodes, maskInfo: FastTrieBlobBitMaskInfo, info: Readonly<PartialTrieInfo>) {
        this.nodes = nodes;
        const { NodeMaskEOW, NodeMaskChildCharIndex, NodeChildRefShift } = maskInfo;
        this.NodeMaskEOW = NodeMaskEOW;
        this.NodeMaskChildCharIndex = NodeMaskChildCharIndex;
        this.NodeChildRefShift = NodeChildRefShift;

        this.info = mergeOptionalWithDefaults(info);
    }
}

interface TrieMethods extends Readonly<TrieCharacteristics> {
    readonly nodeFindNode: (idx: number, word: string) => number | undefined;
    readonly nodeFindExact: (idx: number, word: string) => boolean;
    readonly nodeGetChild: (idx: number, letter: string) => number | undefined;
    readonly isForbidden: (word: string) => boolean;
    readonly findExact: (word: string) => boolean;
}

export class FastTrieBlobInternalsAndMethods extends FastTrieBlobInternals implements TrieMethods {
    readonly nodeFindNode: (idx: number, word: string) => number | undefined;
    readonly nodeFindExact: (idx: number, word: string) => boolean;
    readonly nodeGetChild: (idx: number, letter: string) => number | undefined;
    readonly isForbidden: (word: string) => boolean;
    readonly findExact: (word: string) => boolean;
    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;

    constructor(
        nodes: Nodes,
        maskInfo: FastTrieBlobBitMaskInfo,
        info: PartialTrieInfo,
        trieMethods: Readonly<TrieMethods>,
    ) {
        super(nodes, maskInfo, info);
        this.nodeFindExact = trieMethods.nodeFindExact;
        this.nodeGetChild = trieMethods.nodeGetChild;
        this.isForbidden = trieMethods.isForbidden;
        this.findExact = trieMethods.findExact;
        this.nodeFindNode = trieMethods.nodeFindNode;
        this.hasForbiddenWords = trieMethods.hasForbiddenWords;
        this.hasCompoundWords = trieMethods.hasCompoundWords;
        this.hasNonStrictWords = trieMethods.hasNonStrictWords;
    }
}

/**
 * Sorts the nodes in place if possible.
 * @param nodes
 * @param mask
 * @returns
 */
export function sortNodes(nodes: Uint32Array[], mask: number): Uint32Array[] {
    if (Object.isFrozen(nodes)) {
        assertSorted(nodes, mask);
        return nodes;
    }
    for (let i = 0; i < nodes.length; ++i) {
        let node = nodes[i];
        if (node.length > 2) {
            const isFrozen = Object.isFrozen(node);
            node = isFrozen ? Uint32Array.from(node) : node;
            const nodeInfo = node[0];
            node[0] = 0;
            node.sort((a, b) => (!a ? -1 : !b ? 1 : (a & mask) - (b & mask)));
            // console.log({ i, n: node.map((n, i) => (i ? [n & mask, (n & ~mask) / (mask + 1)] : n)) });
            node[0] = nodeInfo;
            if (isFrozen) {
                nodes[i] = node;
                Object.freeze(node);
            }
        }
    }

    Object.freeze(nodes);

    return nodes;
}

export function assertSorted(nodes: Uint32Array[], mask: number): void {
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        if (node.length > 2) {
            let last = -1;
            for (let j = 1; j < node.length; ++j) {
                const n = node[j] & mask;
                if (n < last) {
                    throw new Error(`Node ${i} is not sorted. ${last} > ${n}`);
                }
                last = n;
            }
        }
    }
}
