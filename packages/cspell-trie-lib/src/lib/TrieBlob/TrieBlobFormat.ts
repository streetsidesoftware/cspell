/**
 * This is the description of the Trie Blob Node format.
 */

/**
 * Trie Blob Format is a compact binary representation of a trie data structure.
 * It is designed for efficient storage and retrieval of words. It should be useable
 * in memory without needing to be unpacked or modified.
 * For efficiency, nodes are stored in a flat array with fixed-size entries.
 *
 * The format consists of a series of nodes.
 * Node 0 is always the root node.
 * Node 1 is always the End of Word (EOW) node.
 * Nodes 2...N are the other nodes.
 *
 */

/**
 * Each node has a header followed by child entries.
 *
 * The header is a 32-bit unsigned integer with the following layout:
 * - Bits 0-7: Number of children (up to 255)
 * - Bit 8: End of Word (EOW) flag
 * - Bits 9-29: Prefix Index into the String Table (21 bits, up to 2,097,151)
 * - Bits 30-31: Reserved for future use
 *
 * Each child entry is a 32-bit unsigned integer with the following layout:
 * - Bits 0-7: Character index (0-255)
 * - Bits 8-30: Reference to the child node (node index shifted right by 8 bits)
 * - Bit 31: Reserved for future use
 */

// Node header constants
export const NodeHeaderNumChildrenBits = 8 as const;
export const NodeHeaderNumChildrenShift = 0 as const;
export const NodeHeaderEOWMask = 0x0000_0100 as const;
export const NodeHeaderPrefixMask = 0x3fff_fe00 as const;
export const NodeHeaderPrefixShift = 9 as const;
export const NodeHeaderPrefixBits = 21 as const;
export const NodeHeaderNumChildrenMask = 0xff as const; // (1 << NodeHeaderNumChildrenBits) - 1

// Node child entry constants

export const NodeMaskCharByte = 0x0000_00ff as const;
export const NodeChildIndexRefShift = 8 as const;

/**
 * A 32-bit number
 * - Bits 0-7: Number of children (up to 255)
 * - Bit 8: End of Word (EOW) flag
 * - Bits 9-31: Reserved for future use
 */
export type NodeHeader = number;

/**
 * A 32-bit number
 * - Bits 0-7: Character index (0-255)
 * - Bits 8-30: Reference to the child node (node index shifted right by 8 bits)
 * - Bit 31: Reserved for future use
 */
export type NodeChildEntry = number;

export type Node = Uint32Array<ArrayBuffer> | [NodeHeader, ...NodeChildEntry[]];
export type TrieBlobNode32 = Uint32Array<ArrayBuffer>;

export type FastTrieBlobNodes32 = TrieBlobNode32[];

/**
 * All the Trie Blob Nodes are represented as a single Uint32Array.
 * Each node is a slice of the array.
 */
export type TrieBlobNodes = Uint32Array<ArrayBuffer>;

/**
 * Get the number of entries in the node.
 * @param header - A node header value
 * @returns the number of entries in the node
 */
export function getCount(header: NodeHeader): number {
    return header & NodeHeaderNumChildrenMask;
}

export function isEOW(header: NodeHeader): boolean {
    return (header & NodeHeaderEOWMask) !== 0;
}

/**
 * Get the node index of the child node.
 * @param childEntry
 * @returns The node index of the child node.
 */
export function getChildNodeIndex(childEntry: NodeChildEntry): number {
    return childEntry >> NodeChildIndexRefShift;
}
