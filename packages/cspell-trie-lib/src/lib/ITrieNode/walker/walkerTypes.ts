import type { ITrieNode } from '../ITrieNode.js';

export { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from '../../walker/walkerTypes.js';

export interface YieldResult {
    text: string;
    node: ITrieNode;
    depth: number;
}

export type FalseToNotGoDeeper = boolean;

/**
 * By default a Walker Iterator will go depth first. To prevent the
 * walker from going deeper use `iterator.next(false)`.
 */
export type WalkerIterator = Generator<YieldResult, void, FalseToNotGoDeeper | undefined>;
