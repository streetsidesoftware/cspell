import type { PartialTrieInfo, TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { StringTable } from '../StringTable/StringTable.ts';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.ts';
import { TrieBlob } from './TrieBlob.ts';
import {
    NodeChildIndexRefShift,
    NodeHeaderNumChildrenMask,
    NodeMaskCharByte,
    type TrieBlobNode32,
} from './TrieBlobFormat.ts';

type Nodes = TrieBlobNode32[];

export class FastTrieBlobInternals {
    readonly info: Readonly<TrieInfo>;
    readonly stringTable: StringTable;
    readonly nodes: Nodes;
    readonly characteristics: Readonly<Partial<TrieCharacteristics>>;

    constructor(
        nodes: Nodes,
        stringTable: StringTable,
        info: Readonly<PartialTrieInfo>,
        characteristics: Readonly<Partial<TrieCharacteristics>>,
    ) {
        this.nodes = nodes;
        this.stringTable = stringTable;

        this.info = mergeOptionalWithDefaults(info);
        this.characteristics = characteristics;
    }
}

interface SortableNode {
    [index: number]: number;
    length: number;
    sort(compareFn: (a: number, b: number) => number): this;
    subarray?(start: number, end?: number): SortableNode;
    slice(start?: number, end?: number): SortableNode;
}

/**
 * Sorts the nodes in place if possible.
 * @param nodes
 * @param mask
 * @returns
 */
export function sortNodes<T extends SortableNode>(nodes: T[], mask: number): T[] {
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        if (node.length <= 2 || isSorted(node, mask, 1)) continue;
        sortSubArray(node, mask, 1);
    }
    return nodes;
}

function sortSubArray<T extends SortableNode>(node: T, mask: number, startAt: number): void {
    const compare = (a: number, b: number) => (!a ? -1 : !b ? 1 : (a & mask) - (b & mask));
    if (node.subarray === undefined) {
        const subArray = node.slice(startAt);
        subArray.sort(compare);
        for (let i = 0; i < subArray.length; ++i) {
            node[i + startAt] = subArray[i];
        }
        return;
    }
    const sortSubArray = node.subarray(startAt);
    sortSubArray.sort(compare);
}

export function assertSorted<T extends SortableNode>(nodes: T[], mask: number, skip: number = 1): void {
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        if (!isSorted(node, mask, skip)) {
            throw new Error(`Node ${i} is not sorted.`);
        }
    }
}

function isSorted<T extends SortableNode>(node: T, mask: number, start: number, end?: number): boolean {
    if (node.length > 2) {
        const limit = end ?? node.length;
        let last = -1;
        for (let j = start; j < limit; ++j) {
            const n = node[j] & mask;
            if (n < last) {
                return false;
            }
            last = n;
        }
    }
    return true;
}

export function toTrieBlob(ft: FastTrieBlobInternals): TrieBlob {
    const nodeMaskChildCharIndex = NodeMaskCharByte;
    const nodeChildRefShift = NodeChildIndexRefShift;
    const nodes: Nodes = ft.nodes;

    function calcNodeToIndex(nodes: Nodes): number[] {
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

    const NodeHeaderMask = ~NodeHeaderNumChildrenMask;

    let offset = 0;
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        // assert(offset === nodeToIndex[i]);
        binNodes[offset++] = ((node.length - 1) << lenShift) | (node[0] & NodeHeaderMask);
        for (let j = 1; j < node.length; ++j) {
            const v = node[j];
            const nodeRef = v >>> nodeChildRefShift;
            const charIndex = v & nodeMaskChildCharIndex;
            binNodes[offset++] = (nodeToIndex[nodeRef] << refShift) | charIndex;
        }
    }

    return new TrieBlob(binNodes, ft.stringTable, ft.info);
}
