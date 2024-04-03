import type { ITrieNode, ITrieNodeRoot } from './ITrieNode/ITrieNode.js';
import type { TrieInfo } from './ITrieNode/TrieInfo.js';

export interface TrieData {
    info: Readonly<TrieInfo>;
    /** Method used to split words into individual characters. */
    wordToCharacters(word: string): readonly string[];
    words(): Iterable<string>;
    getRoot(): ITrieNodeRoot;
    getNode(prefix: string): ITrieNode | undefined;
    has(word: string): boolean;
    isForbiddenWord(word: string): boolean;
    hasForbiddenWords(): boolean;
    size: number;
}
