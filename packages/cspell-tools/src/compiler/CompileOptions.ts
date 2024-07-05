export interface CompileOptions {
    /**
     * Sort the words in the resulting dictionary.
     * Does not apply to `trie` based formats.
     */
    sort: boolean;

    /**
     * Generate lower case / accent free versions of words.
     */
    generateNonStrict: boolean;

    /**
     * Optional filter function to filter out words.
     * @param word the word to test
     * @returns `true` to keep the word, `false` to exclude it.
     */
    filter?: (word: string) => boolean;

    /**
     * Injects `cspell-dictionary` directives into the dictionary header.
     *
     * Example:
     *
     * ```ini
     * # cspell-dictionary: no-generate-alternatives
     * ```
     *
     */
    dictionaryDirectives?: string[] | undefined;
}
