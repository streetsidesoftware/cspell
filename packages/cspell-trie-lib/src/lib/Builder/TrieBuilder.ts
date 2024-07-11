import type { PartialTrieOptions, TrieOptions } from '../trie.js';
import type { TrieData } from '../TrieData.js';
import type { BuilderCursor } from './BuilderCursor.js';

export interface TrieBuilder<T extends TrieData> {
    /**
     * Use this method to convert a word into an array of characters.
     * Since `[...word]` is not equal to `word.split('')` or `word[i]` in some cases,
     * this method is used to ensure that the characters are split correctly.
     * @see [String.codePointAt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt)
     * @see [String.charCodeAt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt)
     * @param word - The word to convert into an array of characters.
     * @returns An array of characters, one for each character in the word.
     */
    wordToCharacters(word: string): string[];
    /**
     * This should be called before adding words to the trie, otherwise the order of the word my be unpredictable.
     * @param letters - letters of the alphabet - order and duplicate characters do NOT matter, they will be sorted.
     */
    setCharacterSet(letters: string | Iterable<string>): void;
    getCursor(): BuilderCursor;
    build(): T;
    setOptions(options: Readonly<PartialTrieOptions>): Readonly<TrieOptions>;
}
