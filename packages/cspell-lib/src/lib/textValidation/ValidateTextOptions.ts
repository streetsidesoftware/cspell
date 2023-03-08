export interface ValidateTextOptions {
    /**
     * Generate suggestions where there are spelling issues.
     */
    generateSuggestions?: boolean;

    /**
     * The number of suggestions to generate. The higher the number the longer it takes.
     */
    numSuggestions?: number;

    /**
     * Verify that the in-document directives are correct.
     */
    validateDirectives?: boolean;
}
