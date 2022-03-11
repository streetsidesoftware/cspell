export interface Options {
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
    debugMode: boolean;
}

export const defaultOptions: Options = {
    numSuggestions: 8,
    generateSuggestions: true,
    debugMode: false,
};
