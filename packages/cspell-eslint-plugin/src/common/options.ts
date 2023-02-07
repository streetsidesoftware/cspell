export interface Options extends Check {
    /**
     * Number of spelling suggestions to make.
     * @default 8
     */
    numSuggestions: number;

    /**
     * Generate suggestions
     * @default true
     */
    generateSuggestions: boolean;

    /**
     * Output debug logs
     * @default false
     */
    debugMode?: boolean;
}

export type RequiredOptions = Required<Options>;

export interface Check {
    /**
     * Ignore import and require names
     * @default true
     */
    ignoreImports?: boolean;
    /**
     * Ignore the properties of imported variables, structures, and types.
     *
     * Example:
     * ```
     * import { example } from 'third-party';
     *
     * const msg = example.property; // `property` is not spell checked.
     * ```
     *
     * @default true
     */
    ignoreImportProperties?: boolean;
    /**
     * Spell check identifiers (variables names, function names, class names, etc.)
     * @default true
     */
    checkIdentifiers?: boolean;
    /**
     * Spell check strings
     * @default true
     */
    checkStrings?: boolean;
    /**
     * Spell check template strings
     * @default true
     */
    checkStringTemplates?: boolean;
    /**
     * Spell check JSX Text
     * @default true
     */
    checkJSXText?: boolean;
    /**
     * Spell check comments
     * @default true
     */
    checkComments?: boolean;
    /**
     * Specify a path to a custom word list file.
     *
     * example:
     * ```js
     * customWordListFile: "./myWords.txt"
     * ```
     */
    customWordListFile?: CustomWordListFilePath | CustomWordListFile | undefined;
}

/**
 * Specify a path to a custom word list file
 */
export type CustomWordListFilePath = string;

export interface CustomWordListFile {
    /**
     * Path to word list file.
     * File format: 1 word per line
     */
    path: CustomWordListFilePath;
}

export type WorkerOptions = RequiredOptions & { cwd: string };
