import type { ITrieNodeId } from '../ITrieNode/index.ts';
import { assert } from '../utils/assert.ts';
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
}

export interface TrieBlobNodeRefAndPrefix extends TrieBlobNodeRef {
    /** the prefix bytes if they exist */
    prefix: U8Array | undefined;
}

export function trieBlobNodeRefToITrieNodeId(ref: TrieBlobNodeRef): ITrieNodeId {
    return (BigInt(ref.nodeIdx) << 32n) + BigInt(ref.pfx);
}

export function iTrieNodeIdToTrieBlobNodeRefParts(id: ITrieNodeId): TrieBlobNodeRef {
    assert(typeof id === 'bigint', 'iTrieNodeIdToTrieBlobNodeRefParts: id must be a bigint');
    const nodeIdx = Number(id >> 32n) & 0xffff_ffff;
    const pfx = Number(id & 0xffff_ffffn); // cspell:ignore 0xffff_ffffn
    return { nodeIdx, pfx };
}
