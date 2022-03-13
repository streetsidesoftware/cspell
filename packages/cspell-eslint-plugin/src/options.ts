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
}

export const defaultCheckOptions: Required<Check> = {
    checkComments: true,
    checkIdentifiers: true,
    checkStrings: true,
    checkStringTemplates: true,
    ignoreImports: true,
    ignoreImportProperties: true,
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
