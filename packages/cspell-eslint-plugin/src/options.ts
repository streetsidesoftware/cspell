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
     * Spell check comments
     * @default true
     */
    checkComments?: boolean;
    /**
     * Specify a path to a custom word list file
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
    /**
     * **Experimental**: Provide a fix option to add words to the file.
     *
     * Note: this does not yet work perfectly.
     */
    addWords: boolean;
}

export const defaultCheckOptions: Required<Check> = {
    checkComments: true,
    checkIdentifiers: true,
    checkStrings: true,
    checkStringTemplates: true,
    customWordListFile: undefined,
    ignoreImportProperties: true,
    ignoreImports: true,
};

export const defaultOptions: Required<Options> = {
    ...defaultCheckOptions,
    numSuggestions: 8,
    generateSuggestions: true,
    debugMode: false,
};

export function normalizeOptions(opts: Options | undefined): Required<Options> {
    const options: Required<Options> = Object.assign({}, defaultOptions, opts || {});
    return options;
}
