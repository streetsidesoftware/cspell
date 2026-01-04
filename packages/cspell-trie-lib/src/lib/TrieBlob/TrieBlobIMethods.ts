import type { ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import type { TrieCharacteristics, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { TrieBlobNodeRef } from './TrieBlobNodeRef.ts';

export type NodeRef = TrieBlobNodeRef;

type ITrieSupportMethods = Required<Pick<ITrieNodeRoot, 'find'>>;

interface TrieMethods extends Readonly<TrieCharacteristics>, ITrieSupportMethods {
    nodeFindNode: (ref: NodeRef, word: string) => NodeRef | undefined;
    nodeFindExact: (ref: NodeRef, word: string) => boolean;
    nodeGetChild: (ref: NodeRef, letter: string) => NodeRef | undefined;
    isForbidden: (word: string) => boolean;
    findExact: (word: string) => boolean;
    find: ITrieSupportMethods['find'];
    nodeToITrieNodeId: (ref: NodeRef) => ITrieNodeId;
    fromITrieNodeId: (id: ITrieNodeId) => NodeRef;
    isEow(ref: NodeRef): boolean;
    hasChildren(ref: NodeRef): boolean;
    getChildEntries(ref: NodeRef): (readonly [string, NodeRef])[];
}

export interface ITrieBlobIMethods extends TrieMethods {
    readonly info: Readonly<TrieInfo>;
    readonly nodes: Uint32Array;
}
