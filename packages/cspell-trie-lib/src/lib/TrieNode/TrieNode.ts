import type { TrieOptions } from '../ITrieNode/TrieOptions.js';

export const FLAG_WORD = 1;

export type ChildMap = Record<string, TrieNode>;

export interface TrieNode {
    f?: number | undefined; // flags
    c?: ChildMap | undefined;
}

export interface TrieRoot extends TrieOptions {
    c: ChildMap;
}
