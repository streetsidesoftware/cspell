import type { TrieNode } from '../../TrieNode';

export const JOIN_SEPARATOR = '+';
export const WORD_SEPARATOR = ' ';

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
}

export enum CompoundWordsMethod {
    /**
     * Do not compound words.
     */
    NONE = 0,
    /**
     * Create word compounds separated by spaces.
     */
    SEPARATE_WORDS,
    /**
     * Create word compounds without separation.
     */
    JOIN_WORDS,
}

export type WalkerIterator = Generator<YieldResult, void, boolean | undefined>;
