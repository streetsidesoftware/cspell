import type { ITrieNodeRoot } from './ITrieNode/ITrieNode.js';
import type { TrieOptions } from './ITrieNode/TrieOptions.js';

export interface TrieData {
    options: Readonly<TrieOptions>;
    words(): Iterable<string>;
    getRoot(): ITrieNodeRoot;
    has(word: string): boolean;
    isForbiddenWord(word: string): boolean;
}
