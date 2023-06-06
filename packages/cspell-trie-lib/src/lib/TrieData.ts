import type { ITrieNodeRoot } from './ITrieNode/ITrieNode.js';
import type { TrieInfo } from './ITrieNode/TrieInfo.js';

export interface TrieData {
    info: Readonly<TrieInfo>;
    words(): Iterable<string>;
    getRoot(): ITrieNodeRoot;
    has(word: string): boolean;
    isForbiddenWord(word: string): boolean;
    hasForbiddenWords(): boolean;
}
