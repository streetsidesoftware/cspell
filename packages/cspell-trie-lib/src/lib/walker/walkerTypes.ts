import type { TrieNode } from '../TrieNode/TrieNode.js';

export const JOIN_SEPARATOR = '+';
export const WORD_SEPARATOR = ' ';

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
}

const CompoundWordsMethodEnum = {
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

type CompoundWordsMethodEnum = typeof CompoundWordsMethodEnum;

export type CompoundWordsMethod = CompoundWordsMethodEnum[keyof CompoundWordsMethodEnum];

interface CompoundWordsMethodByName extends CompoundWordsMethodEnum {
    '0': 'NONE';
    '1': 'SEPARATE_WORDS';
    '2': 'JOIN_WORDS';
}

export const CompoundWordsMethod: CompoundWordsMethodByName = {
    ...CompoundWordsMethodEnum,
    0: 'NONE',
    1: 'SEPARATE_WORDS',
    2: 'JOIN_WORDS',
} as const;

export type WalkerIterator = Generator<YieldResult, void, boolean | undefined>;
