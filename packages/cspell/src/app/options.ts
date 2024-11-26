import { CSpellSettings } from '@cspell/cspell-types';

import type { CacheOptions } from './util/cache/index.js';

export interface LinterOptions extends Omit<BaseOptions, 'config'>, Omit<CacheOptions, 'version'> {
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
     * The resulting files are filtered against the `files` globs found in the configuration.
     */
    fileList?: string[] | undefined;

    /**
     * List of file paths to spell check. These can be relative or absolute
     * paths, but not Globs. Relative paths are relative to {@link LinterOptions.root}.
     * The files are combined with the file paths read from {@link LinterOptions.fileList}.
     * These files are filtered against the `files` globs found in the configuration.
     */
    files?: string[] | undefined;

    /**
     * Alias of {@link LinterOptions.files}.
     */
    file?: string[] | undefined;

    /**
     * Use the `files` configuration to filter the files found.
     */
    filterFiles?: boolean | undefined;

    /**
     * Files must be found and processed otherwise it is considered an error.
     */
    mustFindFiles?: boolean;

    /**
     * Stop processing and exit if an issue or error is found.
     */
    failFast?: boolean;

    /**
     * Optional list of reporters to use, overriding any specified in the
     * configuration.
     */
    reporter?: string[];

    /**
     * Load and parse documents, but do not spell check.
     */
    skipValidation?: boolean;

    /**
     * Path to configuration file.
     */
    config?: string | CSpellConfigFile;
}

export interface TraceOptions extends BaseOptions {
    stdin?: boolean;
    allowCompoundWords?: boolean;
    ignoreCase?: boolean;
    all?: boolean;
    onlyFound?: boolean;
    dictionaryPath?: 'hide' | 'long' | 'short' | 'full';
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
    dictionaries?: string[] | undefined;

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
    useStdin?: boolean | undefined;

    /**
     * Use REPL interface for making suggestions.
     */
    repl?: boolean;
}

export interface LegacyOptions {
    local?: string;
}

export type LegacyFixes = Pick<BaseOptions, 'locale'>;

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
     * Return an exit code if there are issues found.
     * @default true
     */
    exitCode?: boolean;

    /**
     * Execution flags.
     * Used primarily for releasing experimental features.
     * Flags are of the form key:value
     */
    flag?: string[];

    /**
     * Use color in the output.
     * `true` to force color, `false` to turn off color.
     * `undefined` to use color if the output is a TTY.
     */
    color?: boolean | undefined;
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

    /**
     * Generate a summary report of issues.
     */
    issuesSummaryReport?: boolean;

    /**
     * Generate a summary report of performance.
     */
    showPerfSummary?: boolean;

    /**
     * Set the template to use when reporting issues.
     *
     * The template is a string that can contain the following placeholders:
     * - `$filename` - the file name
     * - `$col` - the column number
     * - `$row` - the row number
     * - `$text` - the word that is misspelled
     * - `$message` - the issues message: "unknown word", "word is misspelled", etc.
     * - `$messageColored` - the issues message with color based upon the message type.
     * - `$uri` - the URI of the file
     * - `$suggestions` - suggestions for the misspelled word (if requested)
     * - `$quickFix` - possible quick fixes for the misspelled word.
     * - `$contextFull` - the full context of the misspelled word.
     * - `$contextLeft` - the context to the left of the misspelled word.
     * - `$contextRight` - the context to the right of the misspelled word.
     *
     * Color is supported using the following template pattern:
     * - `{<style[.style]> <text>}` - where `<style>` is a style name and `<text>` is the text to style.
     *
     * Styles
     * - `bold`, `italic`, `underline`, `strikethrough`, `dim`, `inverse`
     * - `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`
     *
     * Example:
     * @example "{green $filename}:{yellow $row}:{yellow $col} $message {red $text} $quickFix {dim $suggestions}"
     * @since 8.12.0
     */
    issueTemplate?: string;
}

export function fixLegacy<T extends LegacyFixes>(opts: T & LegacyOptions): Omit<T & LegacyOptions, 'local'> {
    const { local, ...rest } = opts;
    if (local && !rest.locale) {
        rest.locale = local;
    }
    return rest;
}

export interface CSpellConfigFile {
    url: URL;
    settings: CSpellSettings;
}
