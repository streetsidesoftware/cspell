export interface CompileCommonAppOptions {
    output?: string | undefined;
    compress: boolean;
    /**
     * @deprecated Use maxDepth
     */
    max_depth?: string | undefined;
    maxDepth?: string | undefined;
    merge?: string | undefined;
    experimental?: string[] | undefined;
    split?: boolean | undefined;
    sort?: boolean | undefined;
    keepRawCase?: boolean | undefined;
    trie?: boolean | undefined;
    trie3?: boolean | undefined;
    trie4?: boolean | undefined;
    trieBase?: string | undefined;
    listFile?: string[] | undefined;
    useLegacySplitter?: boolean | undefined;
    /** Indicate that a config file should be created instead of building. */
    init?: boolean | undefined;
}
export interface CompileAppOptions extends CompileCommonAppOptions {
    sort: boolean;
    keepRawCase: boolean;
}
export interface CompileTrieAppOptions extends CompileCommonAppOptions {
    trie3: boolean;
    trie4: boolean;
}
