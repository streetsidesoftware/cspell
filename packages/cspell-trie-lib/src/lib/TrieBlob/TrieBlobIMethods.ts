import type { ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import type { TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';

interface BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
}

export type NodeRef = number;

type ITrieSupportMethods = Required<Pick<ITrieNodeRoot, 'find'>>;

interface TrieMethods extends Readonly<TrieCharacteristics>, ITrieSupportMethods {
    nodeFindNode: (idx: NodeRef, word: string) => NodeRef | undefined;
    nodeFindExact: (idx: NodeRef, word: string) => boolean;
    nodeGetChild: (idx: NodeRef, letter: string) => NodeRef | undefined;
    isForbidden: (word: string) => boolean;
    findExact: (word: string) => boolean;
    find: ITrieSupportMethods['find'];
    nodeToITrieNodeId: (idx: NodeRef) => ITrieNodeId;
    fromITrieNodeId: (id: ITrieNodeId) => NodeRef;
}

export interface ITrieBlobIMethods extends TrieMethods, BitMaskInfo {
    readonly info: Readonly<TrieInfo>;
    readonly nodes: Uint32Array;
}
