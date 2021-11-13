export interface LinterOptions extends BaseOptions {
    /**
     * Display verbose information
     */
    verbose?: boolean;
    /**
     * Show extensive output.
     */
    debug?: boolean;
    /**
     * a globs to exclude files from being checked.
     */
    exclude?: string[] | string;
    /**
     * Only report the words, no line numbers or file names.
     */
    wordsOnly?: boolean;
    /**
     * unique errors per file only.
     */
    unique?: boolean;
    /**
     * root directory, defaults to `cwd`
     */
    root?: string;
    /**
     * Determine if files / directories starting with `.` should be part
     * of the glob search.
     * @default false
     */
    dot?: boolean;
    /**
     * Show part of a line where an issue is found.
     * if true, it will show the default number of characters on either side.
     * if a number, it will shat number of characters on either side.
     */
    showContext?: boolean | number;
    /**
     * Show suggestions for spelling errors.
     */
    showSuggestions?: boolean;

    /**
     * Store the info about processed files in order to only operate on the changed ones.
     */
    cache?: boolean;

    // cspell:word cspellcache
    /**
     * Path to the cache location. Can be a file or a directory.
     * If none specified .cspellcache will be used.
     * The file will be created in the directory where the cspell command is executed.
     */
    cacheLocation?: string;

    /**
     * Strategy to use for detecting changed files, default: metadata
     */
    cacheStrategy?: 'metadata' | 'content';

    /**
     * Enable filtering out files matching globs found in `.gitignore` files.
     */
    gitignore?: boolean;

    /**
     * Stop searching for a `.gitignore`s when a root is reached.
     */
    gitignoreRoot?: string | string[];
}

export interface TraceOptions extends BaseOptions {
    allowCompoundWords?: boolean;
    ignoreCase?: boolean;
}

export interface BaseOptions {
    config?: string;
    languageId?: string;
    locale?: string;
    local?: string; // deprecated
}
