import type { TrieNode } from '../TrieNode/TrieNode.js';

export const JOIN_SEPARATOR = '+';
export const WORD_SEPARATOR = ' ';

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
}

export const CompoundWordsMethod = {
    /**
     * Do not compound words.
     */
    NONE: 0,
    /**
     * Create word compounds separated by spaces.
     */
    SEPARATE_WORDS: 1,
    /**
     * Create word compounds without separation.
     */
    JOIN_WORDS: 2,
} as const;

export type CompoundWordsMethod = (typeof CompoundWordsMethod)[keyof typeof CompoundWordsMethod];

export type WalkerIterator = Generator<YieldResult, void, boolean | undefined>;
