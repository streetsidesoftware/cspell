import type { ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import type { TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';

interface BitMaskInfo {
    readonly NodeMaskEOW: number;
    readonly NodeMaskNumChildren: number;
    readonly NodeMaskChildCharIndex: number;
    readonly NodeChildRefShift: number;
}

export type NodeRef = number;

type ITrieSupportMethods = Readonly<Required<Pick<ITrieNodeRoot, 'find'>>>;
interface TrieMethods extends Readonly<TrieCharacteristics>, ITrieSupportMethods {
    readonly nodeFindNode: (idx: NodeRef, word: string) => NodeRef | undefined;
    readonly nodeFindExact: (idx: NodeRef, word: string) => boolean;
    readonly nodeGetChild: (idx: NodeRef, letter: string) => NodeRef | undefined;
    readonly isForbidden: (word: string) => boolean;
    readonly findExact: (word: string) => boolean;
    readonly find: ITrieSupportMethods['find'];
}

export interface ITrieBlobIMethods extends TrieMethods, BitMaskInfo {
    readonly info: Readonly<TrieInfo>;
    readonly nodes: Uint32Array;
}
