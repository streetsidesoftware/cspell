export interface CompileCommonAppOptions {
    output?: string;
    compress: boolean;
    /**
     * @deprecated Use maxDepth
     */
    max_depth?: string;
    maxDepth?: string;
    merge?: string;
    experimental: string[];
    split?: boolean;
    sort?: boolean;
    keepRawCase?: boolean;
    trie?: boolean;
    trie3?: boolean;
    trie4?: boolean;
    trieBase?: string;
    useLegacySplitter?: boolean;
}
export interface CompileAppOptions extends CompileCommonAppOptions {
    sort: boolean;
    keepRawCase: boolean;
}
export interface CompileTrieAppOptions extends CompileCommonAppOptions {
    trie3: boolean;
    trie4: boolean;
}
