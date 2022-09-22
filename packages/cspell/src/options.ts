import type { CacheOptions } from './util/cache';

export interface LinterOptions extends BaseOptions, Omit<CacheOptions, 'version'> {
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
    fileList?: string[] | undefined;

    /**
     * Files must be found and processed otherwise it is considered an error.
     */
    mustFindFiles?: boolean;

    /**
     * Stop processing and exit if an issue or error is found.
     */
    failFast?: boolean;
}

export interface TraceOptions extends BaseOptions {
    stdin?: boolean;
    allowCompoundWords?: boolean;
    ignoreCase?: boolean;
}

export interface SuggestionOptions extends BaseOptions {
    /**
     * Strict case and accent checking
     * @default true
     */
    strict?: boolean;

    /**
     * List of dictionaries to use. If specified, only that list of dictionaries will be used.
     */
    dictionaries?: string[];

    /**
     * The number of suggestions to make.
     * @default 8
     */
    numSuggestions?: number;

    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     * @default 4
     */
    numChanges?: number;

    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default true
     */
    includeTies?: boolean;

    /**
     * Use stdin for the input
     */
    useStdin?: boolean;

    /**
     * Use REPL interface for making suggestions.
     */
    repl?: boolean;
}

export interface LegacyOptions {
    local?: string;
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
     * Load the default configuration
     * @default true
     */
    defaultConfiguration?: boolean;

    /**
     * Check In-Document CSpell directives for correctness.
     */
    validateDirectives?: boolean;

    /**
     * Execution flags.
     * Used primarily for releasing experimental features.
     * Flags are of the form key:value
     */
    flag?: string[];
}

export interface LinterCliOptions extends LinterOptions {
    /**
     * Show legacy output
     */
    legacy?: boolean;
    /**
     * Show summary at the end
     */
    summary?: boolean;
    /**
     * Show issues
     */
    issues?: boolean;
    /**
     * Run in silent mode.
     * @default false
     */
    silent?: boolean;
    /**
     * Show progress
     */
    progress?: boolean;
    /**
     * issues are shown with a relative path to the root or `cwd`
     */
    relative?: boolean;
    /**
     * Files must be found or cli will exit with an error.
     */
    mustFindFiles?: boolean;
}

export function fixLegacy<T extends BaseOptions>(opts: T & LegacyOptions): Omit<T & LegacyOptions, 'local'> {
    const { local, ...rest } = opts;
    if (local && !rest.locale) {
        rest.locale = local;
    }
    return rest;
}
