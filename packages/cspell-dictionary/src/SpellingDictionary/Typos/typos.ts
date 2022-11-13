type NoSuggestion = null | undefined;
type SingleSuggestion = string;
type MultipleSuggestions = string[];

/**
 * Typos Definition
 *   key - the incorrect word
 *   value - the suggestions.
 */
export type TyposDef = Record<string, MultipleSuggestions | SingleSuggestion | NoSuggestion>;
