import type { FindFullResult, ITrieNode } from './ITrieNode.ts';

export interface FindNodeResult {
    node: ITrieNode | undefined;
}

export interface FindFullNodeResult extends FindNodeResult, FindFullResult {}
