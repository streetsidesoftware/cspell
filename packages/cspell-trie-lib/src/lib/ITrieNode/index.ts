import type { PartialTrieInfo, TrieInfo } from './TrieInfo.ts';

export type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from './ITrieNode.ts';
export type TrieOptions = TrieInfo;
export type TrieOptionsRO = Readonly<TrieOptions>;
export type PartialTrieOptions = PartialTrieInfo;
export type PartialTrieOptionsRO = Readonly<PartialTrieOptions>;
