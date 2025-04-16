import type { PartialTrieInfo, TrieInfo } from './TrieInfo.js';

export type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from './ITrieNode.js';
export type TrieOptions = TrieInfo;
export type TrieOptionsRO = Readonly<TrieOptions>;
export type PartialTrieOptions = PartialTrieInfo;
export type PartialTrieOptionsRO = Readonly<PartialTrieOptions>;
