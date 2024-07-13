import type { FindResult, ITrieNode } from './ITrieNode.js';

export interface FindNodeResult {
    node: ITrieNode | undefined;
}

export interface FindFullResult extends FindResult {
    /**
     * Is the word explicitly forbidden.
     * - `true` - word is in the forbidden list.
     * - `false` - word is not in the forbidden list.
     * - `undefined` - unknown - was not checked.
     * */
    forbidden: boolean | undefined;
}

export interface FindFullNodeResult extends FindNodeResult, FindFullResult {}
