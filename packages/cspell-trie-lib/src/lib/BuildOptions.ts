export interface BuildOptions {
    /**
     * Optimize the trie for size by merging duplicate sub-tries and using a String Table.
     * @default false
     */
    optimize?: boolean | undefined;

    /**
     * Use a string table to reduce memory usage.
     * @default false
     */
    useStringTable?: boolean | undefined;
}
