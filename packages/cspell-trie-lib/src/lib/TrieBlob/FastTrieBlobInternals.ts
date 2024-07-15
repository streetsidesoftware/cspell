import { CharIndex } from './CharIndex.js';
import type { FastTrieBlobBitMaskInfo } from './FastTrieBlobBitMaskInfo.js';

export class FastTrieBlobInternals implements FastTrieBlobBitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
    readonly isIndexDecoderNeeded: boolean;
    readonly sorted = true;

    constructor(
        readonly nodes: number[][],
        readonly charIndex: CharIndex,
        maskInfo: FastTrieBlobBitMaskInfo,
        sorted = false,
    ) {
        const { NodeMaskEOW, NodeMaskChildCharIndex, NodeChildRefShift } = maskInfo;
        this.NodeMaskEOW = NodeMaskEOW;
        this.NodeMaskChildCharIndex = NodeMaskChildCharIndex;
        this.NodeChildRefShift = NodeChildRefShift;
        this.isIndexDecoderNeeded = charIndex.indexContainsMultiByteChars();
        !sorted && sortNodes(nodes, this.NodeMaskChildCharIndex);
    }
}

/**
 * Sorts the nodes in place if possible.
 * @param nodes
 * @param mask
 * @returns
 */
export function sortNodes(nodes: number[][], mask: number): number[][] {
    for (let i = 0; i < nodes.length; ++i) {
        let node = nodes[i];
        if (node.length > 2) {
            const isFrozen = Object.isFrozen(node);
            node = isFrozen ? [...node] : node;
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

export function assertSorted(nodes: number[][], mask: number): void {
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
