export interface RunConfig extends Partial<CompileRequest> {}

export interface CompileRequest extends CompileTargetOptions, CompileSourceOptions, Experimental {
    /**
     * Specify the directory where all relative paths will resolved against.
     * By default, all relative paths are relative to the current directory.
     */
    rootDir?: string;

    /**
     * Target Dictionaries to create.
     */
    targets: Target[];
}

interface Experimental {
    /**
     * Experimental flags
     */
    experimental?: string[] | undefined;
}

export interface CompileTargetOptions {
    /**
     * Generate lower case / accent free versions of words.
     * @default true
     */
    generateNonStrict?: boolean | undefined;

    /**
     * Sort the words in the resulting dictionary.
     * Does not apply to `trie` based formats.
     * @default: true
     */
    sort?: boolean | undefined;
}

export interface Target extends CompileTargetOptions {
    /**
     * Name of target, used as the basis of target file name.
     */
    name: string;

    /**
     * The target directory
     * @default current directory
     */
    targetDirectory?: FilePath | undefined;

    /**
     * gzip the file?
     * @default: false
     */
    compress?: boolean | undefined;

    /**
     * Format of the dictionary.
     */
    format: DictionaryFormats;

    /**
     * File sources used to build the dictionary.
     */
    sources: DictionarySource[];

    /**
     * Words from the sources that are found in `excludeWordsFrom` files
     * will not be added to the dictionary.
     */
    excludeWordsFrom?: FilePath[] | undefined;

    /**
     * Advanced: Set the trie base number. A value between 10 and 36
     * Set numeric base to use.
     * 10 is the easiest to read.
     * 16 is common hex format.
     * 36 is the most compact.
     */
    trieBase?: number | undefined;
}

export type DictionaryFormats = 'plaintext' | 'trie' | 'trie3' | 'trie4';

/**
 * Note: All relative paths are relative to the config file location.
 */
export type FilePath = string;

export type DictionarySource = FilePath | FileSource | FileListSource;

export interface FileSource extends CompileSourceOptions {
    filename: FilePath;
}

export interface FileListSource extends CompileSourceOptions {
    listFile: FilePath;
}

export interface CompileSourceOptions {
    /**
     * Maximum number of nested Hunspell Rules to apply.
     * This is needed for recursive dictionaries like Hebrew.
     */
    maxDepth?: number | undefined;
    /**
     * Split lines into words.
     * @default false
     */
    split?: boolean | 'legacy' | undefined;
    /**
     * Do not generate lower case / accent free versions of words.
     * @default false
     */
    keepRawCase?: boolean | undefined;
}
