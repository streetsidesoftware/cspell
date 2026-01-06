export interface RunConfig extends Partial<Omit<CompileRequest, 'targets'>> {
    /**
     * Url to JSON Schema
     * @default "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-tools/cspell-tools.config.schema.json"
     */
    $schema?: string | undefined;

    /**
     * Optional Target Dictionaries to create.
     */
    targets?: Target[] | undefined;
    /**
     * Specify the directory where all relative paths will resolved against.
     * By default, all relative paths are relative to the location of the
     * config file.
     */
    rootDir?: string | undefined;
}

export interface CompileRequest extends CompileTargetOptions, CompileSourceOptions {
    /**
     * Specify the directory where all relative paths will resolved against.
     * By default, all relative paths are relative to the current directory.
     */
    rootDir?: string | undefined;

    /**
     * Target Dictionaries to create.
     */
    targets: Target[];

    /**
     * Path to checksum file. `true` - defaults to `./checksum.txt`.
     */
    checksumFile?: string | boolean | undefined;
}

export interface Experimental {
    /**
     * Experimental flags
     */
    experimental?: string[] | undefined;
}

export interface CompileTargetOptions {
    /**
     * Generate lower case / accent free versions of words.
     * @default false
     */
    generateNonStrict?: boolean | undefined;

    /**
     * Sort the words in the resulting dictionary.
     * Does not apply to `trie` based formats.
     * @default true
     */
    sort?: boolean | undefined;

    /**
     * Words in the `allowedSplitWords` are considered correct and can be used
     * as a basis for splitting compound words.
     *
     * If entries can be split so that all the words in the entry are allowed,
     * then only the individual words are added, otherwise the entire entry is added.
     * This is to prevent misspellings in CamelCase words from being introduced into the
     * dictionary.
     */
    allowedSplitWords?: FilePath | FilePath[] | undefined;

    /**
     * Injects `cspell-dictionary` directives into the dictionary header.
     *
     * Example:
     *
     * ```ini
     * # cspell-dictionary: no-generate-alternatives
     * ```
     *
     * Known Directives:
     * ```yaml
     * - split # Tell the dictionary loader to split words
     * - no-split # Tell the dictionary loader to not split words (default)
     * - generate-alternatives # Tell the dictionary loader to generate alternate spellings (default)
     * - no-generate-alternatives # Tell the dictionary loader to not generate alternate spellings
     * ```
     */
    dictionaryDirectives?: string[] | undefined;

    /**
     * Remove duplicate words, favor lower case words over mixed case words.
     * Combine compound prefixes where possible.
     * @default false
     */
    removeDuplicates?: boolean | undefined;
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
     * Setting this value to true will create a `.gz` dictionary file.
     * Use `keepUncompressed` to also keep an uncompressed version.
     * @default false
     */
    compress?: boolean | undefined;

    /**
     * If `compress` is true, setting this value to true will also keep an uncompressed version of the dictionary.
     */
    keepUncompressed?: boolean | undefined;

    /**
     * Format of the dictionary.
     */
    format: DictionaryFormats;

    /**
     * Generate a `.btrie.gz` for the target.
     */
    bTrie?: boolean | BTrieOptions | undefined;

    /**
     * File sources used to build the dictionary.
     */
    sources: DictionarySource[];

    /**
     * Words from the sources that are found in `excludeWordsFrom` files
     * will NOT be added to the dictionary.
     *
     * @since 8.3.2
     */
    excludeWordsFrom?: FilePath[] | undefined;

    /**
     * Words from the sources that are NOT found in `excludeWordsNotFoundIn` files
     * will NOT be added to the dictionary.
     *
     * @since 8.19.4
     */
    excludeWordsNotFoundIn?: FilePath[] | undefined;

    /**
     * Words from the sources that match the regex in `excludeWordsMatchingRegex`
     * will NOT be added to the dictionary.
     *
     * Note: The regex must be a valid JavaScript literal regex expression including the `/` delimiters.
     *
     * @since 8.19.4
     */
    excludeWordsMatchingRegex?: string[] | undefined;

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

export type FilePathOrFilePathArray = FilePath | FilePath[];

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

    /**
     * Words in the `allowedSplitWords` are considered correct and can be used
     * as a basis for splitting compound words.
     *
     * If entries can be split so that all the words in the entry are allowed,
     * then only the individual words are added, otherwise the entire entry is added.
     * This is to prevent misspellings in CamelCase words from being introduced into the
     * dictionary.
     */
    allowedSplitWords?: FilePathOrFilePathArray | undefined;

    /**
     * Camel case words that have been split using the `allowedSplitWords` are added to the dictionary as compoundable words.
     * These words are prefixed / suffixed with `*`.
     * @default false
     */
    storeSplitWordsAsCompounds?: boolean | undefined;

    /**
     * Controls the minimum length of a compound word when storing words using `storeSplitWordsAsCompounds`.
     * The compound words are prefixed / suffixed with `*`, to allow them to be combined with other compound words.
     * If the length is too low, then the dictionary will consider many misspelled words as correct.
     * @default 4
     */
    minCompoundLength?: number | undefined;
}

export interface BTrieOptions {
    /** compress the resulting file */
    compress?: boolean | undefined;
    /** optimize the trie into a DAWG */
    optimize?: boolean | undefined;
    /** use a string table to reduce size */
    useStringTable?: boolean | undefined;
}

export const configFileSchemaURL =
    'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-tools/cspell-tools.config.schema.json';
