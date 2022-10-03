export interface CompileCommonOptions {
    output?: string;
    compress: boolean;
    max_depth?: string;
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
export interface CompileOptions extends CompileCommonOptions {
    sort: boolean;
    keepRawCase: boolean;
}
export interface CompileTrieOptions extends CompileCommonOptions {
    trie3: boolean;
    trie4: boolean;
}
