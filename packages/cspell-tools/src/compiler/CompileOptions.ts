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
}
