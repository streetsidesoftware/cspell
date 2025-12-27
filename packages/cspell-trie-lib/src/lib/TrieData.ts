import type { ITrieNode, ITrieNodeRoot } from './ITrieNode/ITrieNode.ts';
import type { TrieCharacteristics, TrieInfo } from './ITrieNode/TrieInfo.ts';

export interface TrieData extends Readonly<TrieCharacteristics> {
    readonly info: Readonly<TrieInfo>;
    /** Method used to split words into individual characters. */
    wordToCharacters(word: string): readonly string[];
    /**
     * get an iterable for all the words in the dictionary.
     * @param prefix - optional prefix to filter the words returned. The words will be prefixed with this value.
     */
    words(prefix?: string): Iterable<string>;
    getRoot(): ITrieNodeRoot;
    getNode(prefix: string): ITrieNode | undefined;
    has(word: string): boolean;
    isForbiddenWord(word: string): boolean;
    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;
    readonly size: number;
    encodeToBTrie?: () => Uint8Array;
}
