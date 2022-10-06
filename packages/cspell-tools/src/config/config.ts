export interface RunConfig extends CompileTargetOptions {
    /**
     * Optional Target Dictionaries to create.
     */
    targets?: Target[];

    /**
     * Specify the directory where all relative paths will resolved against.
     * By default, all relative paths are relative to the location of the
     * config file.
     */
    rootDir?: string;
}

export interface CompileRequest extends CompileTargetOptions {
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

export interface CompileTargetOptions {
    /**
     * Experimental flags
     */
    experimental?: string[] | undefined;

    // Optional Source Config Defaults
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

export interface Target {
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
     * Sort the words in the resulting dictionary.
     * Does not apply to `trie` based formats.
     * @default: true
     */
    sort?: boolean | undefined;

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

export interface FileSource extends SourceConfig {
    filename: FilePath;
}

export interface FileListSource extends SourceConfig {
    listFile: FilePath;
}

export interface SourceConfig {
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
