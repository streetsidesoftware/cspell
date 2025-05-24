export interface SuggestionsConfiguration {
    /**
     * Number of suggestions to make.
     *
     * @default 10
     */
    numSuggestions?: number;

    /**
     * The maximum amount of time in milliseconds to generate suggestions for a word.
     *
     * @default 500
     */
    suggestionsTimeout?: number;

    /**
     * The maximum number of changes allowed on a word to be considered a suggestions.
     *
     * For example, appending an `s` onto `example` -> `examples` is considered 1 change.
     *
     * Range: between 1 and 5.
     *
     * @default 3
     */
    suggestionNumChanges?: number;
}
