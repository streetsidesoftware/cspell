import type { CacheOptions } from './util/cache';

export interface LinterOptions extends BaseOptions, CacheOptions {
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
     * Enable filtering out files matching globs found in `.gitignore` files.
     */
    gitignore?: boolean;

    /**
     * Stop searching for a `.gitignore`s when a root is reached.
     */
    gitignoreRoot?: string | string[];
    /**
     * List of files that contains the paths to files to be spell checked.
     * The files in the lists will be filtered against the glob patterns.
     * - an entry of `stdin` means to read the file list from **`stdin`**
     */
    fileLists?: string[] | undefined;
}

export interface TraceOptions extends BaseOptions {
    allowCompoundWords?: boolean;
    ignoreCase?: boolean;
}

export interface BaseOptions {
    /**
     * Path to configuration file.
     */
    config?: string;
    /**
     * Programming Language ID.
     */
    languageId?: string;
    /**
     * Locale to use.
     */
    locale?: string;
    /**
     * @deprecated
     */
    local?: string;
}

export interface LinterCliOptions extends Omit<LinterOptions, 'fileLists'> {
    legacy?: boolean;
    summary: boolean;
    issues: boolean;
    silent: boolean;
    mustFindFiles: boolean;
    progress?: boolean;
    /**
     * issues are shown with a relative path to the root or `cwd`
     */
    relative?: boolean;
    /**
     * List of file paths to files that contains a list of files to be spell checked.
     */
    fileList?: string[];
}
