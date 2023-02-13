export interface ExtendedSuggestion {
    /**
     * The suggestion.
     */
    word: string;
    /**
     * The word is preferred above others, except other "preferred" words.
     */
    isPreferred?: boolean;
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
}
