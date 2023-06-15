import type { ITrieNode, ITrieNodeRoot } from './ITrieNode/ITrieNode.js';
import type { TrieInfo } from './ITrieNode/TrieInfo.js';

export interface TrieData {
    info: Readonly<TrieInfo>;
    words(): Iterable<string>;
    getRoot(): ITrieNodeRoot;
    getNode(prefix: string): ITrieNode | undefined;
    has(word: string): boolean;
    isForbiddenWord(word: string): boolean;
    hasForbiddenWords(): boolean;
    size: number;
}
