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
     * Spell check identifiers (variables names, function names, and class names)
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

export const defaultCheckOptions: Check = {
    checkComments: true,
    checkIdentifiers: true,
    checkStrings: true,
    checkStringTemplates: true,
    ignoreImports: true,
};

export const defaultOptions: Options = {
    ...defaultCheckOptions,
    numSuggestions: 8,
    generateSuggestions: true,
    debugMode: false,
};

export function normalizeOptions(opts: Options | undefined): Options {
    const options: Options = Object.assign({}, defaultOptions, opts || {});
    return options;
}
