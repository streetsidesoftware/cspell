import type { PartialTrieInfo, TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { StringTable } from '../StringTable/StringTable.ts';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.ts';
import type { TrieBlobNode32 } from './TrieBlobFormat.ts';

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

    constructor(nodes: Nodes, stringTable: StringTable, info: PartialTrieInfo, trieMethods: Readonly<TrieMethods>) {
        super(nodes, stringTable, info, trieMethods);
        this.nodeFindExact = trieMethods.nodeFindExact;
        this.nodeGetChild = trieMethods.nodeGetChild;
        this.isForbidden = trieMethods.isForbidden;
        this.findExact = trieMethods.findExact;
        this.nodeFindNode = trieMethods.nodeFindNode;
        this.hasForbiddenWords = trieMethods.hasForbiddenWords;
        this.hasCompoundWords = trieMethods.hasCompoundWords;
        this.hasNonStrictWords = trieMethods.hasNonStrictWords;
    }

    get hasPreferredSuggestions(): boolean {
        return !!this.characteristics.hasPreferredSuggestions;
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
