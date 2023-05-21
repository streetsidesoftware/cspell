import type { ITrieNode } from '../ITrieNode.js';

export { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from '../../walker/walkerTypes.js';

export interface YieldResult {
    text: string;
    node: ITrieNode;
    depth: number;
}

export type WalkerIterator = Generator<YieldResult, void, boolean | undefined>;
