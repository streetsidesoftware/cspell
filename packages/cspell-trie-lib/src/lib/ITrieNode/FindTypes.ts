import type { FindFullResult, ITrieNode } from './ITrieNode.js';

export interface FindNodeResult {
    node: ITrieNode | undefined;
}

export interface FindFullNodeResult extends FindNodeResult, FindFullResult {}
