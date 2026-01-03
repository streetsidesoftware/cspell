import { NodeHeaderEOWMask, NodeHeaderNumChildrenMask } from './TrieBlobFormat.ts';
import type { U8Array } from './TypedArray.ts';

/**
 * A reference to a node in the TrieBlob.
 * It includes the node index, the prefix index.
 */

export interface TrieBlobNodeRef {
    /** The index of the node */
    nodeIdx: number;
    /** The index into the prefix if it exists. */
    pfx: number;
    /** the prefix bytes if they exist */
    prefix: U8Array | undefined;
}

export class TrieNodeRef implements TrieBlobNodeRef {
    readonly nodeIdx: number;
    readonly pfx: number;
    readonly prefix: U8Array | undefined;
    readonly nodeHeader: number;
    readonly eow: boolean;
    readonly hasChildren: boolean;

    constructor(nodeIdx: number, pfx: number, prefix: U8Array | undefined, nodeHeader: number) {
        this.nodeIdx = nodeIdx;
        this.pfx = pfx;
        this.prefix = prefix;
        this.nodeHeader = nodeHeader;
        this.eow = !prefix && (nodeHeader & NodeHeaderEOWMask) !== 0;
        this.hasChildren = !!(nodeHeader & NodeHeaderNumChildrenMask || prefix);
    }
}
